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

// Environment Debug Route (only show in production for troubleshooting)
app.get('/api/debug/env', (req, res) => {
  const mongoose = require('mongoose');
  
  // Only show which env vars are set, not their values (security)
  const envStatus = {
    NODE_ENV: !!process.env.NODE_ENV,
    PORT: !!process.env.PORT,
    MONGODB_URI: !!process.env.MONGODB_URI,
    JWT_SECRET: !!process.env.JWT_SECRET,
    FRONTEND_URL: process.env.FRONTEND_URL || 'NOT SET',
    GOOGLE_CLIENT_ID: !!process.env.GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET: !!process.env.GOOGLE_CLIENT_SECRET,
    GOOGLE_CALLBACK_URL: process.env.GOOGLE_CALLBACK_URL || 'NOT SET',
    FACEBOOK_APP_ID: !!process.env.FACEBOOK_APP_ID,
    FACEBOOK_APP_SECRET: !!process.env.FACEBOOK_APP_SECRET,
    FACEBOOK_CALLBACK_URL: process.env.FACEBOOK_CALLBACK_URL || 'NOT SET',
  };
  
  // Database connection state
  const dbState = {
    readyState: mongoose.connection.readyState,
    readyStateText: ['disconnected', 'connected', 'connecting', 'disconnecting'][mongoose.connection.readyState],
    host: mongoose.connection.host || 'not connected',
    name: mongoose.connection.name || 'not connected',
  };

  res.json({
    success: true,
    message: 'Environment configuration status',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    envVarsConfigured: envStatus,
    database: dbState,
    config: {
      frontendUrl: config.frontend.url,
      corsOrigin: config.cors.origin,
      loginSuccessRedirect: config.frontend.loginSuccessRedirect,
      loginFailureRedirect: config.frontend.loginFailureRedirect,
      googleCallbackUrl: config.oauth.google.callbackUrl,
      facebookCallbackUrl: config.oauth.facebook.callbackUrl,
    },
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
