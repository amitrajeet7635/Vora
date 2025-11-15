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
 * Helper function to build redirect URL with error parameter
 * Handles cases where the redirect URL may already contain query params
 */
const buildErrorRedirectUrl = (error) => {
  const failureRedirect = config.frontend.loginFailureRedirect;
  const separator = failureRedirect.includes('?') ? '&' : '?';
  return `${config.frontend.url}${failureRedirect}${separator}error=${error}`;
};

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
 * Verify Facebook access token (client-side login)
 * POST /api/auth/facebook/verify
 */
const verifyFacebookToken = async (req, res, next) => {
  try {
    const { accessToken, userID, email, name, picture } = req.body;

    // Validate required fields
    if (!accessToken || !userID) {
      logger.logSecurityEvent('MISSING_FACEBOOK_TOKEN_DATA', {
        hasAccessToken: !!accessToken,
        hasUserID: !!userID,
        correlationId: req.correlationId,
      });

      return res.status(400).json({
        success: false,
        message: 'Missing required Facebook token data',
      });
    }

    // Verify the access token with Facebook Graph API
    const response = await fetch(
      `https://graph.facebook.com/debug_token?input_token=${accessToken}&access_token=${config.oauth.facebook.appId}|${config.oauth.facebook.appSecret}`
    );
    
    const tokenData = await response.json();

    // Check if token is valid
    if (!tokenData.data || !tokenData.data.is_valid) {
      logger.logSecurityEvent('INVALID_FACEBOOK_TOKEN', {
        userID,
        correlationId: req.correlationId,
      });

      return res.status(401).json({
        success: false,
        message: 'Invalid Facebook access token',
      });
    }

    // Check if user_id matches
    if (tokenData.data.user_id !== userID) {
      logger.logSecurityEvent('FACEBOOK_USER_ID_MISMATCH', {
        expectedUserID: userID,
        actualUserID: tokenData.data.user_id,
        correlationId: req.correlationId,
      });

      return res.status(401).json({
        success: false,
        message: 'User ID mismatch',
      });
    }

    // If email or name is missing, fetch from Facebook Graph API
    let userEmail = email;
    let userName = name;
    let userPicture = picture;

    if (!userEmail || !userName) {
      try {
        const profileResponse = await fetch(
          `https://graph.facebook.com/me?fields=id,name,email,picture.type(large)&access_token=${accessToken}`
        );
        const profileData = await profileResponse.json();
        
        userEmail = profileData.email || userEmail;
        userName = profileData.name || userName;
        userPicture = profileData.picture || userPicture;
        
        logger.info({
          message: 'Fetched additional Facebook profile data',
          hasEmail: !!userEmail,
          hasName: !!userName,
          correlationId: req.correlationId,
        });
      } catch (graphError) {
        logger.error({
          message: 'Failed to fetch Facebook profile data',
          error: graphError.message,
          correlationId: req.correlationId,
        });
      }
    }

    // Validate we now have required fields
    if (!userEmail || !userName) {
      logger.logSecurityEvent('FACEBOOK_MISSING_REQUIRED_FIELDS', {
        hasEmail: !!userEmail,
        hasName: !!userName,
        correlationId: req.correlationId,
      });

      return res.status(400).json({
        success: false,
        message: 'Could not retrieve email or name from Facebook. Please ensure you granted the necessary permissions.',
      });
    }

    // Find or create user
    let user = await User.findByProvider('facebook', userID);

    if (!user) {
      // Try to find user by email
      user = await User.findOne({ email: userEmail });

      if (user) {
        // Link Facebook to existing account
        await user.linkProvider('facebook', userID);
        logger.logAuthEvent('FACEBOOK_PROVIDER_LINKED', {
          userId: user._id,
          email: userEmail,
          correlationId: req.correlationId,
        });
      } else {
        // Create new user
        user = await User.create({
          email: userEmail,
          name: userName,
          avatar: userPicture?.data?.url || null,
          providers: [
            {
              name: 'facebook',
              providerId: userID,
            },
          ],
        });

        logger.logAuthEvent('USER_CREATED_FACEBOOK', {
          userId: user._id,
          email: userEmail,
          correlationId: req.correlationId,
        });
      }
    } else {
      // Update existing user's profile information from Facebook
      let profileUpdated = false;
      
      if (userPicture?.data?.url && user.avatar !== userPicture.data.url) {
        user.avatar = userPicture.data.url;
        profileUpdated = true;
      }
      
      if (userName && user.name !== userName) {
        user.name = userName;
        profileUpdated = true;
      }
      
      if (profileUpdated) {
        await user.save();
        logger.logAuthEvent('PROFILE_UPDATED_FROM_FACEBOOK', {
          userId: user._id,
          correlationId: req.correlationId,
        });
      }
    }

    // Generate session and tokens
    const sessionId = generateSessionId();
    const payload = createTokenPayload(user, sessionId);

    const jwtAccessToken = generateAccessToken(payload);
    const jwtRefreshToken = generateRefreshToken(payload);

    // Add session to user
    const tokenExpiry = getTokenExpiration(config.jwt.refreshExpiresIn);
    await user.addSession(
      sessionId,
      tokenExpiry,
      req.headers['user-agent'],
      req.ip
    );

    // Set cookies
    setAccessTokenCookie(res, jwtAccessToken);
    setRefreshTokenCookie(res, jwtRefreshToken);

    logger.logAuthEvent('FACEBOOK_LOGIN_SUCCESS', {
      userId: user._id,
      email: user.email,
      sessionId,
      correlationId: req.correlationId,
    });

    res.json({
      success: true,
      message: 'Facebook login successful',
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        avatar: user.avatar,
        providers: user.providers.map((p) => ({
          name: p.name,
          linkedAt: p.linkedAt,
        })),
      },
    });
  } catch (error) {
    logger.error({
      message: 'Failed to verify Facebook token',
      error: error.message,
      stack: error.stack,
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

      return res.redirect(buildErrorRedirectUrl(oauthError.error));
    }

    // Validate required parameters
    if (!code || !state) {
      logger.logSecurityEvent('MISSING_OAUTH_PARAMS', {
        provider,
        hasCode: !!code,
        hasState: !!state,
        correlationId: req.correlationId,
      });

      return res.redirect(buildErrorRedirectUrl('invalid_request'));
    }

    // Retrieve PKCE session
    const pkceSession = getPKCESession(state);
    if (!pkceSession) {
      logger.logSecurityEvent('INVALID_PKCE_SESSION', {
        provider,
        state,
        correlationId: req.correlationId,
      });

      return res.redirect(buildErrorRedirectUrl('invalid_state'));
    }

    // Validate provider matches
    if (pkceSession.provider !== provider) {
      logger.logSecurityEvent('PROVIDER_MISMATCH', {
        expected: pkceSession.provider,
        received: provider,
        correlationId: req.correlationId,
      });

      deletePKCESession(state);
      return res.redirect(buildErrorRedirectUrl('provider_mismatch'));
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
    } else {
      // Update existing user's profile information from OAuth provider
      let profileUpdated = false;
      
      if (profile.avatar && user.avatar !== profile.avatar) {
        user.avatar = profile.avatar;
        profileUpdated = true;
      }
      
      if (profile.name && user.name !== profile.name) {
        user.name = profile.name;
        profileUpdated = true;
      }
      
      if (profileUpdated) {
        await user.save();
        logger.logAuthEvent('PROFILE_UPDATED_FROM_OAUTH', {
          userId: user._id,
          provider,
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

    res.redirect(buildErrorRedirectUrl('authentication_failed'));
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
      return res.redirect(buildErrorRedirectUrl('user_not_found'));
    }

    // Link provider
    await user.linkProvider(provider, profile.providerId);

    // Update user profile with information from the linked provider if not already set
    let profileUpdated = false;
    
    if (profile.avatar && !user.avatar) {
      user.avatar = profile.avatar;
      profileUpdated = true;
    }
    
    if (profile.name && !user.name) {
      user.name = profile.name;
      profileUpdated = true;
    }
    
    if (profileUpdated) {
      await user.save();
    }

    logger.logAuthEvent('LINK_ACCOUNT', {
      userId: user._id,
      provider,
      email: profile.email,
      profileUpdated,
      correlationId: req.correlationId,
    });

    // Clean up PKCE session
    deletePKCESession(state);

    res.redirect(`${config.frontend.url}/dashboard?linked=${provider}`);
  } catch (error) {
    logger.error({
      message: 'Account linking failed',
      error: error.message,
      correlationId: req.correlationId,
    });

    deletePKCESession(state);
    res.redirect(
      `${config.frontend.url}/dashboard?error=link_failed&provider=${provider}`
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
  verifyFacebookToken,
  handleOAuthCallback,
  logout,
  unlinkProvider,
};
