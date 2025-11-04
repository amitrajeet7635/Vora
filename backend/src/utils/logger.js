const winston = require('winston');
const config = require('../config/env');
const { v4: uuidv4 } = require('uuid');

/**
 * Winston Logger Configuration
 * Provides structured logging with correlation IDs
 */

// Define log levels
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

// Define log colors
const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'blue',
};

winston.addColors(colors);

// Define log format
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.metadata({ fillExcept: ['message', 'level', 'timestamp', 'label'] })
);

// Console format for development
const consoleFormat = winston.format.combine(
  winston.format.colorize({ all: true }),
  winston.format.printf((info) => {
    const { timestamp, level, message, metadata } = info;
    let log = `${timestamp} [${level}]: ${message}`;

    // Add metadata if present
    if (metadata && Object.keys(metadata).length > 0) {
      log += `\n${JSON.stringify(metadata, null, 2)}`;
    }

    return log;
  })
);

// JSON format for production
const jsonFormat = winston.format.combine(
  winston.format.json()
);

// Determine if running in serverless environment (Vercel)
const isServerless = process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME;

// Configure transports based on environment
const transports = [
  // Console transport (always available)
  new winston.transports.Console({
    format: config.isDevelopment ? consoleFormat : jsonFormat,
  }),
];

// Only add file transports in non-serverless environments
if (!isServerless && config.isDevelopment) {
  transports.push(
    new winston.transports.File({
      filename: 'logs/error.log',
      level: 'error',
      format: jsonFormat,
    }),
    new winston.transports.File({
      filename: 'logs/combined.log',
      format: jsonFormat,
    })
  );
}

// Create the logger
const logger = winston.createLogger({
  level: config.logging.level || 'info',
  levels,
  format: logFormat,
  transports,
  // Handle exceptions and rejections
  exceptionHandlers: isServerless 
    ? [new winston.transports.Console({ format: jsonFormat })]
    : [
        new winston.transports.Console({ format: jsonFormat }),
        new winston.transports.File({ filename: 'logs/exceptions.log' })
      ],
  rejectionHandlers: isServerless
    ? [new winston.transports.Console({ format: jsonFormat })]
    : [
        new winston.transports.Console({ format: jsonFormat }),
        new winston.transports.File({ filename: 'logs/rejections.log' })
      ],
});

/**
 * Generate correlation ID for request tracking
 * @returns {string} UUID v4
 */
const generateCorrelationId = () => {
  return uuidv4();
};

/**
 * Create child logger with correlation ID
 * @param {string} correlationId - Correlation ID
 * @returns {Object} Child logger instance
 */
const createChildLogger = (correlationId) => {
  return logger.child({ correlationId });
};

/**
 * Log authentication events
 * @param {string} event - Event type
 * @param {Object} data - Event data
 */
const logAuthEvent = (event, data = {}) => {
  logger.info({
    message: `Auth Event: ${event}`,
    event,
    ...data,
    timestamp: new Date().toISOString(),
  });
};

/**
 * Log user action
 * @param {string} userId - User ID
 * @param {string} action - Action performed
 * @param {Object} metadata - Additional data
 */
const logUserAction = (userId, action, metadata = {}) => {
  logger.info({
    message: `User Action: ${action}`,
    userId,
    action,
    ...metadata,
    timestamp: new Date().toISOString(),
  });
};

/**
 * Log security event
 * @param {string} event - Security event type
 * @param {Object} data - Event data
 */
const logSecurityEvent = (event, data = {}) => {
  logger.warn({
    message: `Security Event: ${event}`,
    event,
    ...data,
    timestamp: new Date().toISOString(),
  });
};

/**
 * Log API request
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {number} duration - Request duration in ms
 */
const logApiRequest = (req, res, duration) => {
  logger.http({
    message: 'API Request',
    method: req.method,
    url: req.originalUrl || req.url,
    statusCode: res.statusCode,
    duration: `${duration}ms`,
    ip: req.ip || req.connection.remoteAddress,
    userAgent: req.get('user-agent'),
    correlationId: req.correlationId,
  });
};

// Export logger and helper functions
module.exports = logger;
module.exports.generateCorrelationId = generateCorrelationId;
module.exports.createChildLogger = createChildLogger;
module.exports.logAuthEvent = logAuthEvent;
module.exports.logUserAction = logUserAction;
module.exports.logSecurityEvent = logSecurityEvent;
module.exports.logApiRequest = logApiRequest;
