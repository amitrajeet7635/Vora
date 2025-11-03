const { verifyToken, extractToken } = require('../utils/jwt');
const User = require('../models/User');
const logger = require('../utils/logger');

/**
 * Authentication Middleware
 * Verifies JWT tokens and attaches user to request
 */

/**
 * Verify JWT and authenticate user
 */
const authenticate = async (req, res, next) => {
  try {
    // Extract token from cookies or Authorization header
    const token = extractToken(req);

    if (!token) {
      logger.logSecurityEvent('MISSING_TOKEN', {
        ip: req.ip,
        path: req.path,
        correlationId: req.correlationId,
      });

      return res.status(401).json({
        success: false,
        error: 'Authentication required',
        message: 'No authentication token provided',
      });
    }

    // Verify token
    let decoded;
    try {
      decoded = verifyToken(token);
    } catch (error) {
      logger.logSecurityEvent('INVALID_TOKEN', {
        error: error.message,
        ip: req.ip,
        path: req.path,
        correlationId: req.correlationId,
      });

      return res.status(401).json({
        success: false,
        error: 'Invalid token',
        message: error.message,
      });
    }

    // Fetch user from database
    const user = await User.findById(decoded.userId);

    if (!user) {
      logger.logSecurityEvent('USER_NOT_FOUND', {
        userId: decoded.userId,
        ip: req.ip,
        correlationId: req.correlationId,
      });

      return res.status(401).json({
        success: false,
        error: 'User not found',
        message: 'The user associated with this token no longer exists',
      });
    }

    // Verify session is still active
    const sessionExists = user.activeSessions.some(
      (session) => session.sessionId === decoded.sessionId
    );

    if (!sessionExists) {
      logger.logSecurityEvent('SESSION_INVALID', {
        userId: user._id,
        sessionId: decoded.sessionId,
        ip: req.ip,
        correlationId: req.correlationId,
      });

      return res.status(401).json({
        success: false,
        error: 'Session expired',
        message: 'Your session has been invalidated. Please log in again.',
      });
    }

    // Attach user and session info to request
    req.user = user;
    req.sessionId = decoded.sessionId;
    req.tokenPayload = decoded;

    next();
  } catch (error) {
    logger.error({
      message: 'Authentication middleware error',
      error: error.message,
      stack: error.stack,
      correlationId: req.correlationId,
    });

    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'An error occurred during authentication',
    });
  }
};

/**
 * Optional authentication
 * Attaches user if token is valid, but doesn't fail if missing
 */
const optionalAuthenticate = async (req, res, next) => {
  try {
    const token = extractToken(req);

    if (!token) {
      return next();
    }

    const decoded = verifyToken(token);
    const user = await User.findById(decoded.userId);

    if (user) {
      req.user = user;
      req.sessionId = decoded.sessionId;
      req.tokenPayload = decoded;
    }

    next();
  } catch (error) {
    // Silently fail for optional authentication
    next();
  }
};

/**
 * Role-based authorization middleware
 * @param {Array<string>} allowedRoles - Array of roles that can access the route
 */
const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required',
        message: 'You must be logged in to access this resource',
      });
    }

    // Check if user has any of the allowed roles
    const hasRole = req.user.roles.some((role) => allowedRoles.includes(role));

    if (!hasRole) {
      logger.logSecurityEvent('UNAUTHORIZED_ACCESS', {
        userId: req.user._id,
        userRoles: req.user.roles,
        requiredRoles: allowedRoles,
        path: req.path,
        correlationId: req.correlationId,
      });

      return res.status(403).json({
        success: false,
        error: 'Forbidden',
        message: 'You do not have permission to access this resource',
      });
    }

    next();
  };
};

/**
 * Require specific provider to be linked
 * @param {string} providerName - Provider name (google, facebook)
 */
const requireProvider = (providerName) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required',
      });
    }

    const hasProvider = req.user.providers.some((p) => p.name === providerName);

    if (!hasProvider) {
      return res.status(403).json({
        success: false,
        error: 'Provider not linked',
        message: `You must link your ${providerName} account to access this resource`,
      });
    }

    next();
  };
};

module.exports = {
  authenticate,
  optionalAuthenticate,
  authorize,
  requireProvider,
};
