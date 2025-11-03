const User = require('../models/User');
const googleOAuthService = require('../services/googleOAuth.service');
const facebookOAuthService = require('../services/facebookOAuth.service');
const {
  savePKCESession,
  getPKCESession,
  deletePKCESession,
  validateState,
  parseOAuthError,
} = require('../utils/oauth');
const {
  generateAccessToken,
  generateRefreshToken,
  generateSessionId,
  createTokenPayload,
  setAccessTokenCookie,
  setRefreshTokenCookie,
  clearAuthCookies,
  getTokenExpiration,
} = require('../utils/jwt');
const logger = require('../utils/logger');
const config = require('../config/env');

/**
 * Auth Controller
 * Handles OAuth authentication flows
 */

/**
 * Initiate Google OAuth flow
 * GET /api/auth/google
 */
const initiateGoogleLogin = async (req, res, next) => {
  try {
    const { authUrl, pkceParams } = googleOAuthService.getAuthorizationUrl();

    // Save PKCE session
    savePKCESession(pkceParams.state, {
      provider: 'google',
      codeVerifier: pkceParams.codeVerifier,
      nonce: pkceParams.nonce,
      linkAccount: req.query.link === 'true', // Flag for account linking
      userId: req.query.userId, // User ID if linking
    });

    logger.logAuthEvent('GOOGLE_LOGIN_INITIATED', {
      correlationId: req.correlationId,
      linkAccount: req.query.link === 'true',
    });

    res.redirect(authUrl);
  } catch (error) {
    logger.error({
      message: 'Failed to initiate Google login',
      error: error.message,
      correlationId: req.correlationId,
    });
    next(error);
  }
};

/**
 * Initiate Facebook OAuth flow
 * GET /api/auth/facebook
 */
const initiateFacebookLogin = async (req, res, next) => {
  try {
    const { authUrl, pkceParams } = facebookOAuthService.getAuthorizationUrl();

    // Save PKCE session
    savePKCESession(pkceParams.state, {
      provider: 'facebook',
      codeVerifier: pkceParams.codeVerifier,
      nonce: pkceParams.nonce,
      linkAccount: req.query.link === 'true',
      userId: req.query.userId,
    });

    logger.logAuthEvent('FACEBOOK_LOGIN_INITIATED', {
      correlationId: req.correlationId,
      linkAccount: req.query.link === 'true',
    });

    res.redirect(authUrl);
  } catch (error) {
    logger.error({
      message: 'Failed to initiate Facebook login',
      error: error.message,
      correlationId: req.correlationId,
    });
    next(error);
  }
};

/**
 * Handle OAuth callback
 * GET /api/auth/callback/:provider
 */
const handleOAuthCallback = async (req, res, next) => {
  try {
    const { provider } = req.params;
    const { code, state, error, error_description } = req.query;

    // Check for OAuth errors
    const oauthError = parseOAuthError(req.query);
    if (oauthError) {
      logger.logAuthEvent('OAUTH_ERROR', {
        provider,
        error: oauthError.error,
        description: oauthError.description,
        correlationId: req.correlationId,
      });

      return res.redirect(
        `${config.frontend.url}${config.frontend.loginFailureRedirect}?error=${oauthError.error}`
      );
    }

    // Validate required parameters
    if (!code || !state) {
      logger.logSecurityEvent('MISSING_OAUTH_PARAMS', {
        provider,
        hasCode: !!code,
        hasState: !!state,
        correlationId: req.correlationId,
      });

      return res.redirect(
        `${config.frontend.url}${config.frontend.loginFailureRedirect}?error=invalid_request`
      );
    }

    // Retrieve PKCE session
    const pkceSession = getPKCESession(state);
    if (!pkceSession) {
      logger.logSecurityEvent('INVALID_PKCE_SESSION', {
        provider,
        state,
        correlationId: req.correlationId,
      });

      return res.redirect(
        `${config.frontend.url}${config.frontend.loginFailureRedirect}?error=invalid_state`
      );
    }

    // Validate provider matches
    if (pkceSession.provider !== provider) {
      logger.logSecurityEvent('PROVIDER_MISMATCH', {
        expected: pkceSession.provider,
        received: provider,
        correlationId: req.correlationId,
      });

      deletePKCESession(state);
      return res.redirect(
        `${config.frontend.url}${config.frontend.loginFailureRedirect}?error=provider_mismatch`
      );
    }

    // Get OAuth service
    const oauthService =
      provider === 'google' ? googleOAuthService : facebookOAuthService;

    // Complete OAuth flow
    const { profile, tokens } = await oauthService.completeOAuthFlow(
      code,
      pkceSession.codeVerifier
    );

    // Check if this is account linking
    if (pkceSession.linkAccount && pkceSession.userId) {
      return await handleAccountLinking(
        req,
        res,
        pkceSession.userId,
        provider,
        profile,
        state
      );
    }

    // Find or create user
    let user = await User.findByProvider(provider, profile.providerId);

    if (!user) {
      // Try to find user by email
      user = await User.findOne({ email: profile.email });

      if (user) {
        // Link provider to existing account
        await user.linkProvider(provider, profile.providerId);
        logger.logAuthEvent('PROVIDER_LINKED', {
          userId: user._id,
          provider,
          email: profile.email,
          correlationId: req.correlationId,
        });
      } else {
        // Create new user
        user = await User.create({
          name: profile.name,
          email: profile.email,
          avatar: profile.avatar,
          providers: [
            {
              name: provider,
              providerId: profile.providerId,
            },
          ],
        });

        logger.logAuthEvent('USER_CREATED', {
          userId: user._id,
          provider,
          email: profile.email,
          correlationId: req.correlationId,
        });
      }
    }

    // Update last login
    await user.updateLastLogin();

    // Generate session
    const sessionId = generateSessionId();
    const tokenPayload = createTokenPayload(user, sessionId);

    // Generate JWT tokens
    const accessToken = generateAccessToken(tokenPayload);
    const refreshToken = generateRefreshToken(tokenPayload);

    // Save session
    const accessTokenExpiry = getTokenExpiration(config.jwt.expiresIn);
    await user.addSession(
      sessionId,
      accessTokenExpiry,
      req.get('user-agent'),
      req.ip
    );

    // Set cookies
    setAccessTokenCookie(res, accessToken);
    setRefreshTokenCookie(res, refreshToken);

    // Clean up PKCE session
    deletePKCESession(state);

    logger.logAuthEvent('LOGIN_SUCCESS', {
      userId: user._id,
      provider,
      email: user.email,
      sessionId,
      ip: req.ip,
      correlationId: req.correlationId,
    });

    // Redirect to frontend
    res.redirect(`${config.frontend.url}${config.frontend.loginSuccessRedirect}`);
  } catch (error) {
    logger.error({
      message: 'OAuth callback error',
      error: error.message,
      stack: error.stack,
      correlationId: req.correlationId,
    });

    res.redirect(
      `${config.frontend.url}${config.frontend.loginFailureRedirect}?error=authentication_failed`
    );
  }
};

/**
 * Handle account linking
 */
const handleAccountLinking = async (
  req,
  res,
  userId,
  provider,
  profile,
  state
) => {
  try {
    const user = await User.findById(userId);

    if (!user) {
      deletePKCESession(state);
      return res.redirect(
        `${config.frontend.url}${config.frontend.loginFailureRedirect}?error=user_not_found`
      );
    }

    // Link provider
    await user.linkProvider(provider, profile.providerId);

    logger.logAuthEvent('LINK_ACCOUNT', {
      userId: user._id,
      provider,
      email: profile.email,
      correlationId: req.correlationId,
    });

    // Clean up PKCE session
    deletePKCESession(state);

    res.redirect(`${config.frontend.url}/settings?linked=${provider}`);
  } catch (error) {
    logger.error({
      message: 'Account linking failed',
      error: error.message,
      correlationId: req.correlationId,
    });

    deletePKCESession(state);
    res.redirect(
      `${config.frontend.url}/settings?error=link_failed&provider=${provider}`
    );
  }
};

/**
 * Logout
 * POST /api/auth/logout
 */
const logout = async (req, res, next) => {
  try {
    if (req.user && req.sessionId) {
      // Remove session from user
      await req.user.removeSession(req.sessionId);

      logger.logAuthEvent('LOGOUT', {
        userId: req.user._id,
        sessionId: req.sessionId,
        ip: req.ip,
        correlationId: req.correlationId,
      });
    }

    // Clear cookies
    clearAuthCookies(res);

    res.json({
      success: true,
      message: 'Logged out successfully',
    });
  } catch (error) {
    logger.error({
      message: 'Logout error',
      error: error.message,
      correlationId: req.correlationId,
    });
    next(error);
  }
};

/**
 * Unlink provider
 * POST /api/auth/unlink/:provider
 */
const unlinkProvider = async (req, res, next) => {
  try {
    const { provider } = req.params;

    if (!['google', 'facebook'].includes(provider)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid provider',
      });
    }

    await req.user.unlinkProvider(provider);

    logger.logAuthEvent('UNLINK_ACCOUNT', {
      userId: req.user._id,
      provider,
      correlationId: req.correlationId,
    });

    res.json({
      success: true,
      message: `${provider} account unlinked successfully`,
      user: req.user,
    });
  } catch (error) {
    logger.error({
      message: 'Unlink provider error',
      error: error.message,
      correlationId: req.correlationId,
    });

    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
};

module.exports = {
  initiateGoogleLogin,
  initiateFacebookLogin,
  handleOAuthCallback,
  logout,
  unlinkProvider,
};
