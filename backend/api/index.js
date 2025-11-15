require('dotenv').config();

const connectDB = require('../src/config/db');

let app;
let dbConnectionPromise = null;

try {
  // Import the Express app
  app = require('../app');
  
  // Initialize database connection once and cache the promise
  const ensureDBConnection = () => {
    if (!dbConnectionPromise) {
      console.log('🔄 Initializing database connection...');
      dbConnectionPromise = connectDB()
        .then(() => {
          console.log('✅ Database connected successfully');
          return true;
        })
        .catch((error) => {
          console.error('❌ Database connection failed:', error.message);
          // Reset promise so next request can retry
          dbConnectionPromise = null;
          throw error;
        });
    }
    return dbConnectionPromise;
  };
  
  // Start DB connection immediately (serverless warm-up)
  ensureDBConnection().catch(err => {
    console.error('Initial DB connection attempt failed:', err.message);
  });
  
  // Add middleware to ensure DB is connected before processing requests
  const originalApp = app;
  const express = require('express');
  const wrappedApp = express();
  
  wrappedApp.use(async (req, res, next) => {
    try {
      // Ensure database is connected before handling request
      await ensureDBConnection();
      next();
    } catch (error) {
      console.error('Database connection error in request handler:', error.message);
      // Let the request proceed - the actual route handler will handle DB errors
      next();
    }
  });
  
  wrappedApp.use(originalApp);
  app = wrappedApp;
  
} catch (error) {
  console.error('❌ FATAL: App initialization failed:', error);
  console.error('Error details:', error.stack);
  
  // Create a minimal fallback app
  const express = require('express');
  app = express();
  app.use((req, res) => {
    res.status(500).json({
      success: false,
      error: 'Server initialization failed',
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  });
}

// Export the Express app for Vercel
module.exports = app;
