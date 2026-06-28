import logger from '../utils/logger.js';
import AppError from '../utils/appError.js';
import { ERROR_CODES } from '../utils/appError.js';

const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Server Error';
  let errorCode = err.errorCode || ERROR_CODES.INTERNAL_ERROR;
  let details = err.details || null;

  // Mongoose Bad ObjectId (CastError)
  if (err.name === 'CastError') {
    statusCode = 404;
    message = `Resource not found with id of ${err.value}`;
    errorCode = ERROR_CODES.NOT_FOUND;
  }

  // Mongoose Duplicate Key
  if (err.code === 11000) {
    statusCode = 400;
    message = 'Duplicate field value entered';
    errorCode = ERROR_CODES.DUPLICATE_KEY;
  }

  // Mongoose Validation Error
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = Object.values(err.errors).map(val => val.message).join(', ');
    errorCode = ERROR_CODES.VALIDATION_ERROR;
    details = Object.entries(err.errors).map(([field, val]) => ({
      field,
      message: val.message
    }));
  }

  // Mongoose network timeout
  if (err.name === 'MongooseError' && err.message.includes('timed out')) {
    statusCode = 503;
    message = 'Database operation timed out';
    errorCode = ERROR_CODES.SERVICE_UNAVAILABLE;
  }

  // JWT Errors
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Not authorized, token validation failed';
    errorCode = ERROR_CODES.AUTHENTICATION_ERROR;
  }

  if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Not authorized, token has expired';
    errorCode = ERROR_CODES.AUTHENTICATION_ERROR;
  }

  // Multer/Upload errors
  if (err.name === 'MulterError') {
    statusCode = 400;
    message = `Upload error: ${err.message}`;
    errorCode = ERROR_CODES.VALIDATION_ERROR;
  }

  // Hide internal details in production
  if (statusCode === 500 && process.env.NODE_ENV === 'production') {
    message = 'Internal Server Error';
    details = null;
  }

  const level = statusCode >= 500 ? 'error' : statusCode >= 400 ? 'warn' : 'info';
  logger[level]({ err, statusCode, errorCode, path: req.originalUrl }, message);

  res.status(statusCode).json({
    success: false,
    errorCode,
    message,
    ...(details && { errors: details }),
    ...(process.env.NODE_ENV !== 'production' && err.stack && { stack: err.stack.split('\n').slice(0, 4).join('\n') })
  });
};

export default errorHandler;
