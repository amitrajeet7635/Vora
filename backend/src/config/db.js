const mongoose = require('mongoose');
const logger = require('../utils/logger');

let cachedConnection = null;

const connectDB = async () => {
  // Return cached connection if available and connected
  if (cachedConnection && mongoose.connection.readyState === 1) {
    logger.info('Using cached MongoDB connection');
    return cachedConnection;
  }

  // If mongoose is in connecting state, wait for it
  if (mongoose.connection.readyState === 2) {
    logger.info('MongoDB connection in progress, waiting...');
    await new Promise((resolve) => {
      mongoose.connection.once('connected', resolve);
      // Also handle error case
      mongoose.connection.once('error', resolve);
    });
    
    if (mongoose.connection.readyState === 1) {
      logger.info('MongoDB connection established');
      cachedConnection = mongoose.connection;
      return cachedConnection;
    }
  }

  // If mongoose has an existing connection, use it
  if (mongoose.connection.readyState === 1) {
    logger.info('Reusing active MongoDB connection');
    cachedConnection = mongoose.connection;
    return cachedConnection;
  }

  try {
    const options = {
      // Connection pool settings - optimized for serverless
      maxPoolSize: 10, // Increased from 1 for better concurrency
      minPoolSize: 1, // Keep at least 1 connection alive
      socketTimeoutMS: 45000, // 45 seconds
      serverSelectionTimeoutMS: 10000, // 10 seconds
      connectTimeoutMS: 10000, // 10 seconds
      family: 4, // Use IPv4
      // Enable buffering for serverless to prevent errors
      bufferCommands: true, // Changed to true for serverless
      maxIdleTimeMS: 60000, // Close idle connections after 60 seconds
    };

    logger.info('Initiating MongoDB connection...');
    const conn = await mongoose.connect(process.env.MONGODB_URI, options);

    cachedConnection = conn.connection;

    logger.info({
      message: 'MongoDB connected successfully',
      host: conn.connection.host,
      database: conn.connection.name,
      readyState: mongoose.connection.readyState,
    });

    // Handle connection events (only set up once)
    if (!mongoose.connection._hasEventListeners) {
      mongoose.connection.on('error', (err) => {
        logger.error({
          message: 'MongoDB connection error',
          error: err.message,
        });
        cachedConnection = null;
      });

      mongoose.connection.on('disconnected', () => {
        logger.warn('MongoDB disconnected');
        cachedConnection = null;
      });

      mongoose.connection.on('reconnected', () => {
        logger.info('MongoDB reconnected');
        cachedConnection = mongoose.connection;
      });

      mongoose.connection._hasEventListeners = true;
    }

    return cachedConnection;
  } catch (error) {
    logger.error({
      message: 'MongoDB connection failed',
      error: error.message,
      stack: error.stack,
    });
    
    cachedConnection = null;
    throw error;
  }
};

// Helper function to ensure connection is ready
const ensureConnected = async (maxRetries = 3, retryDelay = 1000) => {
  let lastError;
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      await connectDB();
      
      // Verify connection is actually ready
      if (mongoose.connection.readyState === 1) {
        return true;
      }
      
      // Wait a bit before retry
      if (i < maxRetries - 1) {
        logger.warn(`Connection not ready (attempt ${i + 1}/${maxRetries}), retrying...`);
        await new Promise(resolve => setTimeout(resolve, retryDelay));
      }
    } catch (error) {
      lastError = error;
      if (i < maxRetries - 1) {
        logger.warn(`Connection attempt ${i + 1}/${maxRetries} failed, retrying...`);
        await new Promise(resolve => setTimeout(resolve, retryDelay));
      }
    }
  }
  
  throw lastError || new Error('Failed to establish database connection');
};

module.exports = connectDB;
module.exports.ensureConnected = ensureConnected;
