const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const config = require('../config/env');
const logger = require('./logger');

/**
 * JWT Utility Functions
 * Handles token generation, verification, and refresh logic
 */

/**
 * Generate access token
 * @param {Object} payload - User data to encode
 * @returns {string} JWT token
 */
const generateAccessToken = (payload) => {
  try {
    const token = jwt.sign(payload, config.jwt.secret, {
      expiresIn: config.jwt.expiresIn,
      issuer: 'vora-auth',
      audience: 'vora-app',
    });

    return token;
  } catch (error) {
    logger.error({
      message: 'Error generating access token',
      error: error.message,
    });
    throw new Error('Failed to generate access token');
  }
};

/**
 * Generate refresh token
 * @param {Object} payload - User data to encode
 * @returns {string} Refresh token
 */
const generateRefreshToken = (payload) => {
  try {
    const token = jwt.sign(payload, config.jwt.secret, {
      expiresIn: config.jwt.refreshExpiresIn,
      issuer: 'vora-auth',
      audience: 'vora-app',
    });

    return token;
  } catch (error) {
    logger.error({
      message: 'Error generating refresh token',
      error: error.message,
    });
    throw new Error('Failed to generate refresh token');
  }
};

/**
 * Generate session ID
 * Used to track active sessions
 * @returns {string} Unique session ID
 */
const generateSessionId = () => {
  return crypto.randomBytes(32).toString('hex');
};

/**
 * Verify JWT token
 * @param {string} token - JWT token to verify
 * @returns {Object} Decoded token payload
 */
const verifyToken = (token) => {
  try {
    const decoded = jwt.verify(token, config.jwt.secret, {
      issuer: 'vora-auth',
      audience: 'vora-app',
    });

    return decoded;
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      logger.warn({
        message: 'Token expired',
        expiredAt: error.expiredAt,
      });
      throw new Error('Token expired');
    }

    if (error.name === 'JsonWebTokenError') {
      logger.warn({
        message: 'Invalid token',
        error: error.message,
      });
      throw new Error('Invalid token');
    }

    logger.error({
      message: 'Token verification failed',
      error: error.message,
    });
    throw new Error('Token verification failed');
  }
};

/**
 * Create JWT payload from user object
 * @param {Object} user - User document
 * @param {string} sessionId - Session identifier
 * @returns {Object} Token payload
 */
const createTokenPayload = (user, sessionId) => {
  return {
    userId: user._id.toString(),
    email: user.email,
    name: user.name,
    roles: user.roles,
    sessionId: sessionId,
  };
};

/**
 * Set access token cookie
 * @param {Object} res - Express response object
 * @param {string} token - JWT token
 */
const setAccessTokenCookie = (res, token) => {
  res.cookie(config.jwt.cookieName, token, config.cookie);
};

/**
 * Set refresh token cookie
 * @param {Object} res - Express response object
 * @param {string} token - Refresh token
 */
const setRefreshTokenCookie = (res, token) => {
  res.cookie(config.jwt.refreshCookieName, token, config.refreshCookie);
};

/**
 * Clear authentication cookies
 * @param {Object} res - Express response object
 */
const clearAuthCookies = (res) => {
  res.clearCookie(config.jwt.cookieName, {
    httpOnly: config.cookie.httpOnly,
    secure: config.cookie.secure,
    sameSite: config.cookie.sameSite,
  });

  res.clearCookie(config.jwt.refreshCookieName, {
    httpOnly: config.refreshCookie.httpOnly,
    secure: config.refreshCookie.secure,
    sameSite: config.refreshCookie.sameSite,
  });
};

/**
 * Extract token from request
 * Checks both cookies and Authorization header
 * @param {Object} req - Express request object
 * @returns {string|null} JWT token or null
 */
const extractToken = (req) => {
  // Check cookies first
  if (req.cookies && req.cookies[config.jwt.cookieName]) {
    return req.cookies[config.jwt.cookieName];
  }

  // Check Authorization header
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }

  return null;
};

/**
 * Extract refresh token from request
 * @param {Object} req - Express request object
 * @returns {string|null} Refresh token or null
 */
const extractRefreshToken = (req) => {
  if (req.cookies && req.cookies[config.jwt.refreshCookieName]) {
    return req.cookies[config.jwt.refreshCookieName];
  }

  return null;
};

/**
 * Calculate token expiration date
 * @param {string} expiresIn - Expiration string (e.g., '15m', '7d')
 * @returns {Date} Expiration date
 */
const getTokenExpiration = (expiresIn) => {
  const now = new Date();
  
  // Parse expiration string
  const match = expiresIn.match(/^(\d+)([smhd])$/);
  if (!match) {
    throw new Error('Invalid expiration format');
  }

  const value = parseInt(match[1], 10);
  const unit = match[2];

  const multipliers = {
    s: 1000,
    m: 60 * 1000,
    h: 60 * 60 * 1000,
    d: 24 * 60 * 60 * 1000,
  };

  const milliseconds = value * multipliers[unit];
  return new Date(now.getTime() + milliseconds);
};

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  generateSessionId,
  verifyToken,
  createTokenPayload,
  setAccessTokenCookie,
  setRefreshTokenCookie,
  clearAuthCookies,
  extractToken,
  extractRefreshToken,
  getTokenExpiration,
};
