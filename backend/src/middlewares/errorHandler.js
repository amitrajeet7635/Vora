const logger = require('../utils/logger');
const config = require('../config/env');

/**
 * Error Handling Middleware
 * Centralized error handling with proper logging
 */

/**
 * Custom API Error class
 */
class ApiError extends Error {
  constructor(statusCode, message, isOperational = true, stack = '') {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    
    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

/**
 * Not Found Error Handler
 */
const notFound = (req, res, next) => {
  const error = new ApiError(
    404,
    `Route not found - ${req.originalUrl}`
  );
  next(error);
};

/**
 * Global Error Handler
 */
const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;
  error.statusCode = err.statusCode || 500;

  // Log error
  logger.error({
    message: error.message,
    statusCode: error.statusCode,
    stack: err.stack,
    url: req.originalUrl,
    method: req.method,
    ip: req.ip,
    userId: req.user?._id,
    correlationId: req.correlationId,
  });

  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    error = new ApiError(400, 'Invalid ID format');
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern)[0];
    error = new ApiError(
      400,
      `An account with this ${field} already exists`
    );
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map((e) => e.message);
    error = new ApiError(400, errors.join(', '));
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    error = new ApiError(401, 'Invalid token');
  }

  if (err.name === 'TokenExpiredError') {
    error = new ApiError(401, 'Token expired');
  }

  // Express-validator errors
  if (err.array && typeof err.array === 'function') {
    const errors = err.array().map((e) => `${e.param}: ${e.msg}`);
    error = new ApiError(400, errors.join(', '));
  }

  // Build response
  const response = {
    success: false,
    error: error.message || 'Internal server error',
    statusCode: error.statusCode,
  };

  // Include stack trace in development
  if (config.isDevelopment) {
    response.stack = err.stack;
  }

  // Include validation errors if present
  if (err.errors) {
    response.validationErrors = err.errors;
  }

  // Add correlation ID for tracking
  if (req.correlationId) {
    response.correlationId = req.correlationId;
  }

  res.status(error.statusCode).json(response);
};

/**
 * Async handler wrapper
 * Wraps async route handlers to catch errors
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

/**
 * Validation error handler
 * Formats express-validator errors
 */
const validationErrorHandler = (req, res, next) => {
  const { validationResult } = require('express-validator');
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const formattedErrors = errors.array().map((err) => ({
      field: err.param,
      message: err.msg,
      value: err.value,
    }));

    logger.warn({
      message: 'Validation failed',
      errors: formattedErrors,
      url: req.originalUrl,
      correlationId: req.correlationId,
    });

    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      errors: formattedErrors,
    });
  }

  next();
};

/**
 * Unhandled rejection handler
 */
const handleUnhandledRejection = () => {
  process.on('unhandledRejection', (reason, promise) => {
    logger.error({
      message: 'Unhandled Rejection',
      reason: reason,
      promise: promise,
    });

    // In serverless environments, don't exit - let the function complete
    if (!process.env.VERCEL && !process.env.AWS_LAMBDA_FUNCTION_NAME) {
      process.exit(1);
    }
  });
};

/**
 * Uncaught exception handler
 */
const handleUncaughtException = () => {
  process.on('uncaughtException', (error) => {
    logger.error({
      message: 'Uncaught Exception',
      error: error.message,
      stack: error.stack,
    });

    // In serverless environments, don't exit - let the function complete
    if (!process.env.VERCEL && !process.env.AWS_LAMBDA_FUNCTION_NAME) {
      process.exit(1);
    }
  });
};

module.exports = {
  ApiError,
  notFound,
  errorHandler,
  asyncHandler,
  validationErrorHandler,
  handleUnhandledRejection,
  handleUncaughtException,
};
