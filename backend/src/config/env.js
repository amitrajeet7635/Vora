require('dotenv').config();

/**
 * Environment Configuration
 * Centralized configuration management with validation
 */

const requiredEnvVars = [
  'NODE_ENV',
  'PORT',
  'MONGODB_URI',
  'JWT_SECRET',
  'JWT_EXPIRES_IN',
  'FRONTEND_URL',
  'GOOGLE_CLIENT_ID',
  'GOOGLE_CLIENT_SECRET',
  'GOOGLE_CALLBACK_URL',
  'FACEBOOK_APP_ID',
  'FACEBOOK_APP_SECRET',
  'FACEBOOK_CALLBACK_URL',
];

// Validate required environment variables
const validateEnv = () => {
  const missing = requiredEnvVars.filter((envVar) => !process.env[envVar]);

  if (missing.length > 0) {
    const errorMessage = `Missing required environment variables: ${missing.join(', ')}\n` +
      'Please check your .env file or Vercel environment variables.';
    
    console.error('❌ Environment Validation Failed:');
    console.error(errorMessage);
    console.error('Available env vars:', Object.keys(process.env).filter(k => !k.includes('SECRET')).join(', '));
    
    throw new Error(errorMessage);
  }
};

// Validate on module load with better error handling
try {
  validateEnv();
  console.log('✅ Environment variables validated successfully');
} catch (error) {
  console.error('Environment validation error:', error.message);
  throw error;
}

const config = {
  // Server
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT, 10) || 5001,
  isDevelopment: process.env.NODE_ENV === 'development',
  isProduction: process.env.NODE_ENV === 'production',

  // Database
  mongodb: {
    uri: process.env.MONGODB_URI,
  },

  // JWT
  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: process.env.JWT_EXPIRES_IN || '15m',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
    cookieName: 'vora_token',
    refreshCookieName: 'vora_refresh_token',
  },

  // Frontend
  frontend: {
    url: process.env.FRONTEND_URL,
    loginSuccessRedirect: process.env.FRONTEND_LOGIN_SUCCESS_REDIRECT || '/callback?success=true',
    loginFailureRedirect: process.env.FRONTEND_LOGIN_FAILURE_REDIRECT || '/login',
  },

  // CORS
  cors: {
    origin: process.env.FRONTEND_URL,
    credentials: true,
  },

  // Cookie settings
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production', // HTTPS only in production
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax', // 'none' for cross-origin in production, 'lax' for dev
    maxAge: 15 * 60 * 1000, // 15 minutes in milliseconds
    path: '/', // Ensure cookie is available for all paths
  },

  refreshCookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax', // 'none' for cross-origin in production, 'lax' for dev
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
    path: '/', // Ensure cookie is available for all paths
  },

  // OAuth Providers
  oauth: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackUrl: process.env.GOOGLE_CALLBACK_URL,
      authorizationUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
      tokenUrl: 'https://oauth2.googleapis.com/token',
      userInfoUrl: 'https://www.googleapis.com/oauth2/v2/userinfo',
      scopes: ['email', 'profile'],
    },
    facebook: {
      appId: process.env.FACEBOOK_APP_ID,
      appSecret: process.env.FACEBOOK_APP_SECRET,
      callbackUrl: process.env.FACEBOOK_CALLBACK_URL,
      authorizationUrl: 'https://www.facebook.com/v18.0/dialog/oauth',
      tokenUrl: 'https://graph.facebook.com/v18.0/oauth/access_token',
      userInfoUrl: 'https://graph.facebook.com/me',
      scopes: ['email', 'public_profile'],
    },
  },

  // Rate Limiting
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS, 10) || 15 * 60 * 1000, // 15 minutes
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS, 10) || 100, // limit each IP to 100 requests per windowMs
    authMax: parseInt(process.env.RATE_LIMIT_AUTH_MAX, 10) || 5, // 5 auth attempts per window
  },

  // Session
  session: {
    maxActiveSessions: parseInt(process.env.MAX_ACTIVE_SESSIONS, 10) || 10,
  },

  // Logging
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    format: process.env.LOG_FORMAT || 'json', // 'json' or 'simple'
  },
};

module.exports = config;
