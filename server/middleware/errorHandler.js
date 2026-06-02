const { errorResponse } = require('../utils/apiResponse');

/**
 * Global Express Error Handler Middleware
 */
const errorHandler = (err, req, res, next) => {
  // Log error to server console
  console.error('Error Intercepted by Global Handler:', err);

  // 1. Mongoose Validation Error
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors)
      .map((val) => val.message)
      .join(', ');
    return errorResponse(res, message, 400);
  }

  // 2. Mongoose Duplicate Key (MongoServerError: code 11000)
  if (err.code === 11000) {
    return errorResponse(res, 'Duplicate field value', 400);
  }

  // 3. Mongoose Cast Error (e.g. invalid ObjectId format)
  if (err.name === 'CastError') {
    return errorResponse(res, 'Invalid ID format', 400);
  }

  // 4. Default Internal Server Error
  const statusCode = err.statusCode || 500;
  const message =
    process.env.NODE_ENV === 'production'
      ? 'Internal server error'
      : err.message || 'Internal server error';

  return errorResponse(res, message, statusCode);
};

module.exports = errorHandler;
