import logger from '../utils/logger.js';
import { getRedisClient, isRedisAvailable } from './redisClient.js';

const memoryCache = new Map();
const MEMORY_CACHE_LIMIT = 500;
const WARMUP_THRESHOLD = 5;

const cacheHits = { memory: 0, redis: 0, total: 0 };
const warmupPatterns = new Map();

function getCacheKey(req) {
  const base = req.originalUrl || req.url;
  if (req.user) {
    return `${base}|user:${req.user._id}`;
  }
  return base;
}

function evictIfNeeded() {
  if (memoryCache.size >= MEMORY_CACHE_LIMIT) {
    const oldestKey = memoryCache.keys().next().value;
    if (oldestKey) {
      memoryCache.delete(oldestKey);
    }
  }
}

export const cacheMiddleware = (durationInSeconds, options = {}) => {
  const { warmup = false, keyPrefix = '' } = options;

  return async (req, res, next) => {
    if (req.method !== 'GET') {
      return next();
    }

    const key = keyPrefix + getCacheKey(req);

    try {
      const cached = await getFromCache(key);
      if (cached !== null) {
        cacheHits.total++;
        if (isRedisAvailable()) {
          cacheHits.redis++;
        } else {
          cacheHits.memory++;
        }
        res.setHeader('X-Cache', 'HIT');
        return res.status(200).json(cached);
      }
    } catch {
      // Cache read failed, proceed without caching
    }

    res.setHeader('X-Cache', 'MISS');
    const originalJson = res.json.bind(res);
    res.json = function (body) {
      setInCache(key, body, durationInSeconds).catch(() => {});
      if (warmup) {
        trackWarmup(key, durationInSeconds);
      }
      return originalJson(body);
    };

    next();
  };
};

export const invalidateCache = async (pattern) => {
  const keysToDelete = [];

  for (const key of memoryCache.keys()) {
    if (key.includes(pattern)) {
      keysToDelete.push(key);
    }
  }

  for (const key of keysToDelete) {
    memoryCache.delete(key);
  }

  if (isRedisAvailable()) {
    try {
      const redis = await getRedisClient();
      const stream = redis.scanStream({ match: `*${pattern}*`, count: 100 });
      const pipeline = redis.pipeline();

      stream.on('data', (keys) => {
        for (const key of keys) {
          pipeline.del(key);
        }
      });

      await new Promise((resolve, reject) => {
        stream.on('end', resolve);
        stream.on('error', reject);
      });

      await pipeline.exec();
    } catch (err) {
      logger.warn({ err: err.message }, 'Redis cache invalidation failed');
    }
  }

  logger.info(`Cache invalidated for pattern: ${pattern}`);
};

export function getCacheStats() {
  const hitRate = cacheHits.total > 0
    ? ((cacheHits.memory + cacheHits.redis) / cacheHits.total * 100).toFixed(1)
    : '0.0';

  return {
    memorySize: memoryCache.size,
    memoryLimit: MEMORY_CACHE_LIMIT,
    hits: { memory: cacheHits.memory, redis: cacheHits.redis, total: cacheHits.total },
    hitRate: `${hitRate}%`,
    warmupPatterns: warmupPatterns.size
  };
}

async function getFromCache(key) {
  const memResult = memoryCache.get(key);
  if (memResult && memResult.expire > Date.now()) {
    return memResult.data;
  }
  memoryCache.delete(key);

  if (isRedisAvailable()) {
    try {
      const redis = await getRedisClient();
      const data = await redis.get(key);
      if (data) {
        const parsed = JSON.parse(data);
        memoryCache.set(key, { data: parsed, expire: Date.now() + 30000 });
        return parsed;
      }
    } catch {
      return null;
    }
  }

  return null;
}

async function setInCache(key, data, durationSeconds) {
  evictIfNeeded();
  memoryCache.set(key, {
    data,
    expire: Date.now() + durationSeconds * 1000
  });

  if (isRedisAvailable()) {
    try {
      const redis = await getRedisClient();
      await redis.setex(key, durationSeconds, JSON.stringify(data));
    } catch {
      // Redis write failed, memory cache still works
    }
  }
}

function trackWarmup(key, durationSeconds) {
  const baseKey = key.split('|')[0];
  const count = (warmupPatterns.get(baseKey) || 0) + 1;
  warmupPatterns.set(baseKey, count);

  if (count === WARMUP_THRESHOLD) {
    logger.info(`Cache warmup threshold reached for: ${baseKey}`);
  }
}
