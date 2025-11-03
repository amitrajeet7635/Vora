const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const config = require('./src/config/env');
const logger = require('./src/utils/logger');
const {
  correlationMiddleware,
  requestLogger,
} = require('./src/middlewares/requestLogger');
const {
  errorHandler,
  notFound,
  handleUnhandledRejection,
  handleUncaughtException,
} = require('./src/middlewares/errorHandler');
const { apiLimiter } = require('./src/middlewares/rateLimiter');

// Import routes
const authRoutes = require('./src/routes/auth.routes');
const userRoutes = require('./src/routes/user.routes');

/**
 * Express Application Configuration
 * Production-grade security and middleware setup
 */

// Handle uncaught exceptions and unhandled rejections
handleUncaughtException();
handleUnhandledRejection();

// Initialize Express app
const app = express();

// Trust proxy (for accurate IP addresses behind reverse proxies)
app.set('trust proxy', 1);

// Security Middleware - Helmet
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", 'data:', 'https:'],
      },
    },
    hsts: {
      maxAge: 31536000, // 1 year in seconds
      includeSubDomains: true,
      preload: true,
    },
  })
);

// CORS Configuration
app.use(
  cors({
    origin: config.cors.origin,
    credentials: config.cors.credentials,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'X-Correlation-ID',
      'X-Request-ID',
    ],
    exposedHeaders: ['X-Correlation-ID'],
  })
);

// Body Parsing Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Cookie Parser
app.use(cookieParser());

// Request Correlation and Logging
app.use(correlationMiddleware);
app.use(requestLogger);

// API Rate Limiting (global)
app.use('/api', apiLimiter);

// Health Check Route (no rate limiting)
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Vora backend is healthy',
    timestamp: new Date().toISOString(),
    environment: config.env,
    uptime: process.uptime(),
  });
});

// API Version Info
app.get('/api', (req, res) => {
  res.json({
    success: true,
    message: 'Vora API v1',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      user: '/api/user',
    },
    documentation: 'https://github.com/amitrajeet7635/Vora',
  });
});

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);

// 404 Handler - Must be after all routes
app.use(notFound);

// Global Error Handler - Must be last
app.use(errorHandler);

// Log startup info
logger.info({
  message: 'Express app configured successfully',
  environment: config.env,
  cors: config.cors.origin,
});

module.exports = app;
