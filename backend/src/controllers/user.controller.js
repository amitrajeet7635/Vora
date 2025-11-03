const logger = require('../utils/logger');

/**
 * User Controller
 * Handles user profile operations
 */

/**
 * Get current user profile
 * GET /api/user/me
 */
const getCurrentUser = async (req, res, next) => {
  try {
    // User is already attached by auth middleware
    const user = req.user;

    logger.logUserAction(user._id, 'GET_PROFILE', {
      correlationId: req.correlationId,
    });

    res.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        roles: user.roles,
        providers: user.providers.map((p) => ({
          name: p.name,
          linkedAt: p.linkedAt,
        })),
        lastLoginAt: user.lastLoginAt,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    logger.error({
      message: 'Get current user error',
      error: error.message,
      correlationId: req.correlationId,
    });
    next(error);
  }
};

/**
 * Update user profile
 * PATCH /api/user/me
 */
const updateProfile = async (req, res, next) => {
  try {
    const { name, avatar } = req.body;
    const user = req.user;

    // Update allowed fields
    if (name) user.name = name;
    if (avatar) user.avatar = avatar;

    await user.save();

    logger.logUserAction(user._id, 'UPDATE_PROFILE', {
      updatedFields: Object.keys(req.body),
      correlationId: req.correlationId,
    });

    res.json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        roles: user.roles,
      },
    });
  } catch (error) {
    logger.error({
      message: 'Update profile error',
      error: error.message,
      correlationId: req.correlationId,
    });
    next(error);
  }
};

/**
 * Get user sessions
 * GET /api/user/sessions
 */
const getUserSessions = async (req, res, next) => {
  try {
    const user = req.user;

    // Filter out expired sessions
    const now = new Date();
    const activeSessions = user.activeSessions.filter(
      (session) => session.expiresAt > now
    );

    logger.logUserAction(user._id, 'GET_SESSIONS', {
      sessionCount: activeSessions.length,
      correlationId: req.correlationId,
    });

    res.json({
      success: true,
      sessions: activeSessions.map((session) => ({
        sessionId: session.sessionId,
        createdAt: session.createdAt,
        expiresAt: session.expiresAt,
        userAgent: session.userAgent,
        ip: session.ip,
        isCurrent: session.sessionId === req.sessionId,
      })),
    });
  } catch (error) {
    logger.error({
      message: 'Get sessions error',
      error: error.message,
      correlationId: req.correlationId,
    });
    next(error);
  }
};

/**
 * Revoke a session
 * DELETE /api/user/sessions/:sessionId
 */
const revokeSession = async (req, res, next) => {
  try {
    const { sessionId } = req.params;
    const user = req.user;

    await user.removeSession(sessionId);

    logger.logUserAction(user._id, 'REVOKE_SESSION', {
      sessionId,
      correlationId: req.correlationId,
    });

    res.json({
      success: true,
      message: 'Session revoked successfully',
    });
  } catch (error) {
    logger.error({
      message: 'Revoke session error',
      error: error.message,
      correlationId: req.correlationId,
    });
    next(error);
  }
};

/**
 * Revoke all sessions except current
 * POST /api/user/sessions/revoke-all
 */
const revokeAllSessions = async (req, res, next) => {
  try {
    const user = req.user;
    const currentSessionId = req.sessionId;

    // Keep only current session
    user.activeSessions = user.activeSessions.filter(
      (session) => session.sessionId === currentSessionId
    );

    await user.save();

    logger.logUserAction(user._id, 'REVOKE_ALL_SESSIONS', {
      keptSessionId: currentSessionId,
      correlationId: req.correlationId,
    });

    res.json({
      success: true,
      message: 'All other sessions revoked successfully',
    });
  } catch (error) {
    logger.error({
      message: 'Revoke all sessions error',
      error: error.message,
      correlationId: req.correlationId,
    });
    next(error);
  }
};

/**
 * Delete user account
 * DELETE /api/user/me
 */
const deleteAccount = async (req, res, next) => {
  try {
    const user = req.user;

    logger.logUserAction(user._id, 'DELETE_ACCOUNT', {
      email: user.email,
      correlationId: req.correlationId,
    });

    await user.deleteOne();

    // Clear cookies
    const { clearAuthCookies } = require('../utils/jwt');
    clearAuthCookies(res);

    res.json({
      success: true,
      message: 'Account deleted successfully',
    });
  } catch (error) {
    logger.error({
      message: 'Delete account error',
      error: error.message,
      correlationId: req.correlationId,
    });
    next(error);
  }
};

module.exports = {
  getCurrentUser,
  updateProfile,
  getUserSessions,
  revokeSession,
  revokeAllSessions,
  deleteAccount,
};
