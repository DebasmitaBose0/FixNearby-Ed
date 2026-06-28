import logger from '../utils/logger.js';

const errorCache = new Set();
const ERROR_DEDUP_WINDOW_MS = 60000;

function dedupError(error) {
  const key = error.message || 'unknown-error';
  const now = Date.now();

  if (errorCache.has(key)) {
    return false;
  }

  errorCache.add(key);
  setTimeout(() => errorCache.delete(key), ERROR_DEDUP_WINDOW_MS);
  return true;
}

export function reportError(error, context = {}) {
  const isUnique = dedupError(error);

  if (isUnique) {
    logger.error({
      err: error,
      context,
      timestamp: new Date().toISOString()
    }, 'Application error reported');
  }

  if (process.env.NODE_ENV === 'production' && process.env.ERROR_WEBHOOK_URL) {
    reportToExternalService(error, context).catch(() => {});
  }
}

async function reportToExternalService(error, context) {
  try {
    const payload = {
      message: error.message,
      stack: error.stack,
      context,
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      service: 'FixNearby-API'
    };

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);

    await fetch(process.env.ERROR_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: controller.signal
    });

    clearTimeout(timeout);
  } catch (err) {
    logger.warn({ err: err.message }, 'Failed to report error to external service');
  }
}

export const errorReportingMiddleware = (err, req, res, next) => {
  const context = {
    method: req.method,
    path: req.originalUrl,
    ip: req.ip,
    userId: req.user?._id || 'anonymous'
  };

  reportError(err, context);
  next(err);
};
