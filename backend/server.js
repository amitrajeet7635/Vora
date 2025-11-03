require('dotenv').config();
const app = require('./app');
const config = require('./src/config/env');
const connectDB = require('./src/config/db');
const logger = require('./src/utils/logger');

/**
 * Server Entry Point
 * Initialize database and start Express server
 */

const PORT = config.port || 5001;

/**
 * Start Server
 */
const startServer = async () => {
  try {
    // Connect to MongoDB
    await connectDB();

    // Start Express server
    const server = app.listen(PORT, () => {
      logger.info({
        message: `🚀 Vora backend server started successfully`,
        port: PORT,
        environment: config.env,
        nodeVersion: process.version,
        platform: process.platform,
      });

      logger.info({
        message: '📋 Server Information',
        endpoints: {
          health: `http://localhost:${PORT}/health`,
          api: `http://localhost:${PORT}/api`,
          googleAuth: `http://localhost:${PORT}/api/auth/google`,
          facebookAuth: `http://localhost:${PORT}/api/auth/facebook`,
        },
      });

      // Log environment-specific info
      if (config.isDevelopment) {
        logger.info({
          message: '🔧 Development Mode',
          details: 'Security features may be relaxed for local development',
        });
      }

      if (config.isProduction) {
        logger.info({
          message: '🔒 Production Mode',
          details: 'All security features enabled',
        });
      }
    });

    // Graceful shutdown handlers
    const gracefulShutdown = async (signal) => {
      logger.info({
        message: `${signal} received. Starting graceful shutdown...`,
      });

      server.close(async () => {
        logger.info({
          message: 'HTTP server closed',
        });

        try {
          // Close database connection
          const mongoose = require('mongoose');
          await mongoose.connection.close();
          logger.info({
            message: 'Database connection closed',
          });

          logger.info({
            message: 'Graceful shutdown completed',
          });

          process.exit(0);
        } catch (error) {
          logger.error({
            message: 'Error during graceful shutdown',
            error: error.message,
          });
          process.exit(1);
        }
      });

      // Force shutdown after 10 seconds
      setTimeout(() => {
        logger.error({
          message: 'Forceful shutdown after timeout',
        });
        process.exit(1);
      }, 10000);
    };

    // Listen for termination signals
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

    // Handle server errors
    server.on('error', (error) => {
      if (error.code === 'EADDRINUSE') {
        logger.error({
          message: `Port ${PORT} is already in use`,
          error: error.message,
        });
      } else {
        logger.error({
          message: 'Server error',
          error: error.message,
          stack: error.stack,
        });
      }
      process.exit(1);
    });
  } catch (error) {
    logger.error({
      message: 'Failed to start server',
      error: error.message,
      stack: error.stack,
    });
    process.exit(1);
  }
};

// Start the server
startServer();
