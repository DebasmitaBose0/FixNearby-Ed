import logger from '../utils/logger.js';

let redisClient = null;

export async function getRedisClient() {
  if (redisClient) {
    return redisClient;
  }

  try {
    const { default: Redis } = await import('ioredis');
    const host = process.env.REDIS_HOST || 'localhost';
    const port = parseInt(process.env.REDIS_PORT) || 6379;

    redisClient = new Redis({
      host,
      port,
      retryStrategy: (times) => {
        if (times > 3) {
          logger.warn('Redis connection failed after 3 retries, using in-memory cache fallback');
          return null;
        }
        return Math.min(times * 200, 2000);
      },
      lazyConnect: true,
      maxRetriesPerRequest: 1
    });

    redisClient.on('error', (err) => {
      logger.warn({ err: err.message }, 'Redis client error, falling back to in-memory cache');
      redisClient = null;
    });

    redisClient.on('connect', () => {
      logger.info('Redis client connected');
    });

    await redisClient.connect();
    return redisClient;
  } catch (err) {
    logger.warn({ err: err.message }, 'Redis not available, using in-memory cache fallback');
    redisClient = null;
    return null;
  }
}

export function isRedisAvailable() {
  return redisClient !== null && redisClient.status === 'ready';
}

export async function closeRedisConnection() {
  if (redisClient) {
    try {
      await redisClient.quit();
      redisClient = null;
      logger.info('Redis connection closed');
    } catch (err) {
      logger.warn({ err: err.message }, 'Error closing Redis connection');
    }
  }
}
