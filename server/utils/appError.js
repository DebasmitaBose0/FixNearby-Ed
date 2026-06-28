export const ERROR_CODES = {
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  NOT_FOUND: 'NOT_FOUND',
  DUPLICATE_KEY: 'DUPLICATE_KEY',
  AUTHENTICATION_ERROR: 'AUTHENTICATION_ERROR',
  AUTHORIZATION_ERROR: 'AUTHORIZATION_ERROR',
  RATE_LIMIT_ERROR: 'RATE_LIMIT_ERROR',
  CONFLICT: 'CONFLICT',
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  SERVICE_UNAVAILABLE: 'SERVICE_UNAVAILABLE',
  BAD_REQUEST: 'BAD_REQUEST'
};

class AppError extends Error {
  constructor(message, statusCode, errorCode = null, details = null) {
    super(message);
    this.statusCode = statusCode;
    this.errorCode = errorCode || getErrorCodeForStatus(statusCode);
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;
    this.details = details;
    this.timestamp = new Date().toISOString();

    Error.captureStackTrace(this, this.constructor);
  }

  toJSON() {
    return {
      success: false,
      errorCode: this.errorCode,
      message: this.message,
      statusCode: this.statusCode,
      details: this.details,
      timestamp: this.timestamp
    };
  }
}

function getErrorCodeForStatus(statusCode) {
  const mapping = {
    400: ERROR_CODES.BAD_REQUEST,
    401: ERROR_CODES.AUTHENTICATION_ERROR,
    403: ERROR_CODES.AUTHORIZATION_ERROR,
    404: ERROR_CODES.NOT_FOUND,
    409: ERROR_CODES.CONFLICT,
    422: ERROR_CODES.VALIDATION_ERROR,
    429: ERROR_CODES.RATE_LIMIT_ERROR,
    500: ERROR_CODES.INTERNAL_ERROR,
    503: ERROR_CODES.SERVICE_UNAVAILABLE
  };
  return mapping[statusCode] || ERROR_CODES.INTERNAL_ERROR;
}

export default AppError;
