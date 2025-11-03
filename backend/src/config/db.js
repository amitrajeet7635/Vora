const mongoose = require('mongoose');
const logger = require('../utils/logger');

/**
 * MongoDB Connection Configuration
 * Handles connection lifecycle with retry logic
 */

let isConnected = false;

const connectDB = async () => {
  if (isConnected) {
    logger.info('Using existing MongoDB connection');
    return;
  }

  try {
    const options = {
      // Connection pool settings
      maxPoolSize: 10,
      minPoolSize: 2,
      socketTimeoutMS: 45001,
      serverSelectionTimeoutMS: 5001,
      family: 4, // Use IPv4
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

    // Graceful shutdown
    process.on('SIGINT', async () => {
      try {
        await mongoose.connection.close();
        logger.info('MongoDB connection closed through app termination');
        process.exit(0);
      } catch (err) {
        logger.error({
          message: 'Error closing MongoDB connection',
          error: err.message,
        });
        process.exit(1);
      }
    });
  } catch (error) {
    logger.error({
      message: 'MongoDB connection failed',
      error: error.message,
      stack: error.stack,
    });
    
    // Retry connection after 5 seconds
    logger.info('Retrying MongoDB connection in 5 seconds...');
    setTimeout(connectDB, 5001);
  }
};

module.exports = connectDB;
