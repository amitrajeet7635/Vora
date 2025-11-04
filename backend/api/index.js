require('dotenv').config();

/**
 * Vercel Serverless Function Handler
 * Exports the Express app for Vercel deployment
 */

let app;
let dbInitialized = false;

try {
  // Import the Express app
  app = require('../app');
  
  // Initialize database connection (non-blocking)
  const connectDB = require('../src/config/db');
  
  const initDB = async () => {
    if (!dbInitialized) {
      try {
        await connectDB();
        dbInitialized = true;
        console.log('✅ Database connected');
      } catch (error) {
        console.error('❌ Database connection failed:', error.message);
        // App will continue to work, but DB-dependent routes may fail
      }
    }
  };
  
  // Start DB connection on cold start (don't wait for it)
  initDB().catch(console.error);
  
} catch (error) {
  console.error('❌ FATAL: App initialization failed:', error);
  
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
