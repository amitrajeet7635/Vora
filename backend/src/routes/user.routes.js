const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const {
  getCurrentUser,
  updateProfile,
  getUserSessions,
  revokeSession,
  revokeAllSessions,
  deleteAccount,
} = require('../controllers/user.controller');
const { authenticate, authorize } = require('../middlewares/authMiddleware');
const { validationErrorHandler } = require('../middlewares/errorHandler');
const { apiLimiter } = require('../middlewares/rateLimiter');

/**
 * User Routes
 * Protected routes for user profile management
 */

// Get current user profile (protected)
router.get('/me', authenticate, getCurrentUser);

// Update user profile (protected, with validation)
router.patch(
  '/me',
  authenticate,
  [
    body('name')
      .optional()
      .trim()
      .isLength({ min: 2, max: 100 })
      .withMessage('Name must be between 2 and 100 characters'),
    body('avatar')
      .optional()
      .isURL()
      .withMessage('Avatar must be a valid URL'),
  ],
  validationErrorHandler,
  updateProfile
);

// Get user sessions (protected)
router.get('/sessions', authenticate, getUserSessions);

// Revoke a specific session (protected)
router.delete('/sessions/:sessionId', authenticate, revokeSession);

// Revoke all sessions except current (protected)
router.post('/sessions/revoke-all', authenticate, revokeAllSessions);

// Delete account (protected)
router.delete('/me', authenticate, deleteAccount);

// Admin-only route example
router.get(
  '/admin/stats',
  authenticate,
  authorize('admin'),
  (req, res) => {
    res.json({
      success: true,
      message: 'Admin stats endpoint',
      // Add admin stats logic here
    });
  }
);

module.exports = router;
