require('dotenv').config();
const app = require('../app');
const connectDB = require('../src/config/db');

/**
 * Vercel Serverless Function Handler
 * Exports the Express app for Vercel deployment
 */

// Initialize database connection (will be cached across invocations)
let dbInitialized = false;

const initDB = async () => {
  if (!dbInitialized) {
    try {
      await connectDB();
      dbInitialized = true;
    } catch (error) {
      console.error('Database initialization failed:', error);
      // Continue anyway - some routes might work without DB
    }
  }
};

// Initialize DB on cold start
initDB();

// Export the Express app for Vercel
module.exports = app;
