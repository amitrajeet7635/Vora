const express = require('express');
const router = express.Router();
const {
  initiateGoogleLogin,
  initiateFacebookLogin,
  handleOAuthCallback,
  logout,
  unlinkProvider,
} = require('../controllers/auth.controller');
const { authenticate } = require('../middlewares/authMiddleware');
const { authLimiter } = require('../middlewares/rateLimiter');

/**
 * Auth Routes
 * Handles OAuth2 authentication flows
 */

// OAuth Login Initiation Routes (with rate limiting)
router.get('/google', authLimiter, initiateGoogleLogin);
router.get('/facebook', authLimiter, initiateFacebookLogin);

// OAuth Callback Routes (dynamic provider parameter)
router.get('/callback/:provider', authLimiter, handleOAuthCallback);

// Logout Route (protected)
router.post('/logout', authenticate, logout);

// Account Linking/Unlinking Routes (protected)
router.post('/unlink/:provider', authenticate, unlinkProvider);

// Health check for auth service
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Auth service is healthy',
    timestamp: new Date().toISOString(),
  });
});

module.exports = router;
