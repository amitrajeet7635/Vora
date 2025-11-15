require('dotenv').config();

const connectDB = require('../src/config/db');
const { ensureConnected } = require('../src/config/db');

let app;

try {
  // Import the Express app
  app = require('../app');
  
  console.log('🔄 Vercel serverless function initialized');
  
  // Add middleware to ensure DB is connected before processing requests
  const originalApp = app;
  const express = require('express');
  const wrappedApp = express();
  
  // Critical: Ensure database connection before ANY request
  wrappedApp.use(async (req, res, next) => {
    try {
      console.log(`📡 Incoming request: ${req.method} ${req.path}`);
      
      // Ensure database is connected before handling request
      await ensureConnected(3, 500); // 3 retries, 500ms delay
      
      console.log('✅ Database connection verified');
      next();
    } catch (error) {
      console.error('❌ Database connection error in request handler:', error.message);
      
      // Return error response instead of proceeding
      return res.status(503).json({
        success: false,
        error: 'Database connection failed',
        message: 'Service temporarily unavailable. Please try again.',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
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
