const rateLimit = require('express-rate-limit');
const config = require('../config/env');
const logger = require('../utils/logger');

/**
 * Rate Limiting Middleware
 * Prevents brute force attacks and API abuse
 */

/**
 * General API rate limiter
 */
const apiLimiter = rateLimit({
  windowMs: config.rateLimit.windowMs, // 15 minutes
  max: config.rateLimit.max, // Limit each IP to 100 requests per windowMs
  message: {
    success: false,
    error: 'Too many requests',
    message: 'Too many requests from this IP, please try again later.',
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  handler: (req, res) => {
    logger.logSecurityEvent('RATE_LIMIT_EXCEEDED', {
      ip: req.ip,
      path: req.path,
      userAgent: req.get('user-agent'),
      correlationId: req.correlationId,
    });

    res.status(429).json({
      success: false,
      error: 'Too many requests',
      message: 'You have exceeded the rate limit. Please try again later.',
      retryAfter: res.getHeader('RateLimit-Reset'),
    });
  },
  skip: (req) => {
    // Skip rate limiting for health check endpoints
    return req.path === '/health' || req.path === '/api/health';
  },
});

/**
 * Stricter rate limiter for authentication endpoints
 */
const authLimiter = rateLimit({
  windowMs: config.rateLimit.windowMs, // 15 minutes
  max: config.rateLimit.authMax, // Limit each IP to 5 auth attempts per windowMs
  skipSuccessfulRequests: true, // Don't count successful requests
  message: {
    success: false,
    error: 'Too many authentication attempts',
    message: 'Too many login attempts from this IP, please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    logger.logSecurityEvent('AUTH_RATE_LIMIT_EXCEEDED', {
      ip: req.ip,
      path: req.path,
      userAgent: req.get('user-agent'),
      correlationId: req.correlationId,
    });

    res.status(429).json({
      success: false,
      error: 'Too many authentication attempts',
      message:
        'Too many login attempts. Your IP has been temporarily blocked. Please try again later.',
      retryAfter: res.getHeader('RateLimit-Reset'),
    });
  },
});

/**
 * Rate limiter for password reset/sensitive operations
 */
const sensitiveLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // Limit each IP to 3 attempts per hour
  skipSuccessfulRequests: true,
  message: {
    success: false,
    error: 'Too many attempts',
    message: 'Too many attempts for this operation. Please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    logger.logSecurityEvent('SENSITIVE_OPERATION_RATE_LIMIT_EXCEEDED', {
      ip: req.ip,
      path: req.path,
      userAgent: req.get('user-agent'),
      correlationId: req.correlationId,
    });

    res.status(429).json({
      success: false,
      error: 'Too many attempts',
      message:
        'You have exceeded the limit for this operation. Please try again in one hour.',
      retryAfter: res.getHeader('RateLimit-Reset'),
    });
  },
});

/**
 * Create a custom rate limiter
 * @param {Object} options - Rate limit options
 */
const createRateLimiter = (options) => {
  return rateLimit({
    windowMs: options.windowMs || 15 * 60 * 1000,
    max: options.max || 100,
    message: options.message || {
      success: false,
      error: 'Too many requests',
      message: 'Rate limit exceeded.',
    },
    standardHeaders: true,
    legacyHeaders: false,
    ...options,
  });
};

module.exports = {
  apiLimiter,
  authLimiter,
  sensitiveLimiter,
  createRateLimiter,
};
