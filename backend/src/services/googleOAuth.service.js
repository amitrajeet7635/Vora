const config = require('../config/env');
const {
  createPKCEParams,
  buildAuthorizationUrl,
  exchangeCodeForToken,
  fetchUserProfile,
} = require('../utils/oauth');
const logger = require('../utils/logger');

/**
 * Google OAuth2 Service
 * Handles Google authentication flow with PKCE
 */

class GoogleOAuthService {
  constructor() {
    this.config = config.oauth.google;
    this.providerName = 'google';
  }

  /**
   * Generate Google OAuth authorization URL
   * @returns {Object} Authorization URL and PKCE params
   */
  getAuthorizationUrl() {
    try {
      // Create PKCE parameters
      const pkceParams = createPKCEParams();

      // Build authorization URL
      const authUrl = buildAuthorizationUrl(
        {
          clientId: this.config.clientId,
          callbackUrl: this.config.callbackUrl,
          authorizationUrl: this.config.authorizationUrl,
          scopes: this.config.scopes,
          accessType: 'offline', // Request refresh token
          prompt: 'consent', // Force consent screen to get refresh token
        },
        pkceParams
      );

      logger.info({
        message: 'Generated Google OAuth URL',
        provider: this.providerName,
      });

      return {
        authUrl,
        pkceParams,
      };
    } catch (error) {
      logger.error({
        message: 'Failed to generate Google OAuth URL',
        error: error.message,
      });
      throw error;
    }
  }

  /**
   * Exchange authorization code for access token
   * @param {string} code - Authorization code from callback
   * @param {string} codeVerifier - PKCE code verifier
   * @returns {Object} Token response
   */
  async exchangeCodeForToken(code, codeVerifier) {
    try {
      const tokenResponse = await exchangeCodeForToken(
        code,
        this.config.tokenUrl,
        {
          client_id: this.config.clientId,
          client_secret: this.config.clientSecret,
          redirect_uri: this.config.callbackUrl,
          grant_type: 'authorization_code',
          code_verifier: codeVerifier,
          provider: this.providerName,
        }
      );

      logger.info({
        message: 'Successfully exchanged code for Google token',
        provider: this.providerName,
      });

      return tokenResponse;
    } catch (error) {
      logger.error({
        message: 'Failed to exchange code for Google token',
        error: error.message,
      });
      throw error;
    }
  }

  /**
   * Get user profile from Google
   * @param {string} accessToken - Access token
   * @returns {Object} Normalized user profile
   */
  async getUserProfile(accessToken) {
    try {
      const profile = await fetchUserProfile(
        accessToken,
        this.config.userInfoUrl
      );

      // Normalize profile data
      const normalizedProfile = {
        providerId: profile.id,
        email: profile.email,
        name: profile.name,
        firstName: profile.given_name,
        lastName: profile.family_name,
        avatar: profile.picture,
        emailVerified: profile.verified_email,
        locale: profile.locale,
        provider: this.providerName,
      };

      logger.info({
        message: 'Fetched Google user profile',
        provider: this.providerName,
        email: normalizedProfile.email,
      });

      return normalizedProfile;
    } catch (error) {
      logger.error({
        message: 'Failed to fetch Google user profile',
        error: error.message,
      });
      throw error;
    }
  }

  /**
   * Complete OAuth flow
   * Exchange code for token and fetch user profile
   * @param {string} code - Authorization code
   * @param {string} codeVerifier - PKCE code verifier
   * @returns {Object} User profile and tokens
   */
  async completeOAuthFlow(code, codeVerifier) {
    try {
      // Exchange code for token
      const tokenResponse = await this.exchangeCodeForToken(code, codeVerifier);

      // Fetch user profile
      const userProfile = await this.getUserProfile(tokenResponse.access_token);

      logger.logAuthEvent('GOOGLE_OAUTH_SUCCESS', {
        provider: this.providerName,
        email: userProfile.email,
      });

      return {
        profile: userProfile,
        tokens: {
          accessToken: tokenResponse.access_token,
          refreshToken: tokenResponse.refresh_token,
          expiresIn: tokenResponse.expires_in,
          tokenType: tokenResponse.token_type,
        },
      };
    } catch (error) {
      logger.logAuthEvent('GOOGLE_OAUTH_FAILURE', {
        provider: this.providerName,
        error: error.message,
      });
      throw error;
    }
  }

  /**
   * Refresh access token
   * @param {string} refreshToken - Refresh token
   * @returns {Object} New access token
   */
  async refreshAccessToken(refreshToken) {
    try {
      const response = await axios.post(
        this.config.tokenUrl,
        new URLSearchParams({
          client_id: this.config.clientId,
          client_secret: this.config.clientSecret,
          refresh_token: refreshToken,
          grant_type: 'refresh_token',
        }).toString(),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        }
      );

      logger.info({
        message: 'Refreshed Google access token',
        provider: this.providerName,
      });

      return response.data;
    } catch (error) {
      logger.error({
        message: 'Failed to refresh Google access token',
        error: error.message,
      });
      throw error;
    }
  }
}

module.exports = new GoogleOAuthService();
