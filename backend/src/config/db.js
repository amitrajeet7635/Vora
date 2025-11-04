const mongoose = require('mongoose');
const logger = require('../utils/logger');

/**
 * MongoDB Connection Configuration
 * Handles connection lifecycle with retry logic
 * Optimized for serverless environments (Vercel)
 */

let isConnected = false;

const connectDB = async () => {
  // Check if already connected or connecting
  if (isConnected && mongoose.connection.readyState === 1) {
    logger.info('Using existing MongoDB connection');
    return;
  }

  // If mongoose has an existing connection, use it
  if (mongoose.connection.readyState === 1) {
    isConnected = true;
    logger.info('Reusing active MongoDB connection');
    return;
  }

  try {
    const options = {
      // Connection pool settings - optimized for serverless
      maxPoolSize: 1, // Reduced for serverless (each function instance)
      minPoolSize: 0,
      socketTimeoutMS: 30000, // 30 seconds
      serverSelectionTimeoutMS: 10000, // 10 seconds (faster timeout for serverless)
      family: 4, // Use IPv4
      // Prevent buffering commands in serverless
      bufferCommands: false,
    };

    const conn = await mongoose.connect(process.env.MONGODB_URI, options);

    isConnected = true;

    logger.info({
      message: 'MongoDB connected successfully',
      host: conn.connection.host,
      database: conn.connection.name,
    });

    // Handle connection events
    mongoose.connection.on('error', (err) => {
      logger.error({
        message: 'MongoDB connection error',
        error: err.message,
      });
    });

    mongoose.connection.on('disconnected', () => {
      logger.warn('MongoDB disconnected');
      isConnected = false;
    });

    mongoose.connection.on('reconnected', () => {
      logger.info('MongoDB reconnected');
      isConnected = true;
    });

    // Note: In serverless environments, SIGINT/SIGTERM may not be reliable
    // Vercel handles cleanup automatically
  } catch (error) {
    logger.error({
      message: 'MongoDB connection failed',
      error: error.message,
      stack: error.stack,
    });
    
    isConnected = false;
    
    // Don't retry in serverless - let the next invocation try
    throw error;
  }
};

module.exports = connectDB;
