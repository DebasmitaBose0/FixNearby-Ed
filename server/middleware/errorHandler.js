/**
 * Global Express error handling middleware.
 *
 * In development mode the full error (including stack trace) is returned for
 * easier debugging.  In production only the status and a safe message are sent
 * so that internal implementation details (file paths, Mongoose schema names,
 * dependency versions, etc.) are never leaked to API consumers.
 *
 * Common Mongoose errors are detected and translated into appropriate
 * 400-level status codes instead of the generic 500.
 */
const errorHandler = (err, req, res, next) => {
  // ----- Normalise status code ------------------------------------------------
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';

  // ----- Handle specific Mongoose / MongoDB errors ---------------------------

  // Invalid ObjectId (e.g. GET /api/workers/not-an-id)
  if (err.name === 'CastError') {
    statusCode = 400;
    message = `Invalid ${err.path}: ${err.value}`;
  }

  // Mongoose validation errors (missing required fields, min/max, enum, etc.)
  if (err.name === 'ValidationError') {
    statusCode = 400;
    const messages = Object.values(err.errors).map((e) => e.message);
    message = `Validation failed: ${messages.join(', ')}`;
  }

  // MongoDB duplicate-key error (e.g. registering an email that already exists)
  if (err.code === 11000) {
    statusCode = 400;
    const field = Object.keys(err.keyValue || {}).join(', ') || 'field';
    message = `Duplicate value for ${field}. This value already exists.`;
  }

  // Invalid / expired JWT
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid token. Please log in again.';
  }

  if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Token has expired. Please log in again.';
  }

  // ----- Logging (always log server-side) ------------------------------------
  if (process.env.NODE_ENV === 'development') {
    console.error(`[Error] ${message}`, err.stack);
  } else {
    // In production still log so operators can debug, but don't send to client
    console.error(`[Error] ${message}`);
  }

  // ----- Build response ------------------------------------------------------
  const isDev = process.env.NODE_ENV === 'development';

  res.status(statusCode).json({
    status: statusCode >= 500 ? 'error' : 'fail',
    message,
    // Only expose raw error details and stack trace in development
    ...(isDev && { error: err, stack: err.stack }),
  });
};

export default errorHandler;
