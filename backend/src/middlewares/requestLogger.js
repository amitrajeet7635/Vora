const logger = require('../utils/logger');

/**
 * Request Correlation Middleware
 * Adds correlation ID to each request for tracking
 */
const correlationMiddleware = (req, res, next) => {
  // Generate or extract correlation ID
  const correlationId =
    req.headers['x-correlation-id'] ||
    req.headers['x-request-id'] ||
    logger.generateCorrelationId();

  // Attach to request
  req.correlationId = correlationId;

  // Add to response headers
  res.setHeader('X-Correlation-ID', correlationId);

  // Create child logger with correlation ID
  req.logger = logger.createChildLogger(correlationId);

  next();
};

/**
 * Request Logging Middleware
 * Logs incoming requests and responses
 */
const requestLogger = (req, res, next) => {
  const startTime = Date.now();

  // Log request
  logger.info({
    message: 'Incoming request',
    method: req.method,
    url: req.originalUrl || req.url,
    ip: req.ip || req.connection.remoteAddress,
    userAgent: req.get('user-agent'),
    correlationId: req.correlationId,
  });

  // Override res.json to log response
  const originalJson = res.json.bind(res);
  res.json = function (body) {
    const duration = Date.now() - startTime;
    
    logger.logApiRequest(req, res, duration);

    return originalJson(body);
  };

  next();
};

module.exports = {
  correlationMiddleware,
  requestLogger,
};
