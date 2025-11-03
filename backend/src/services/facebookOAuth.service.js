const config = require('../config/env');
const {
  createPKCEParams,
  buildAuthorizationUrl,
  exchangeCodeForToken,
  fetchUserProfile,
} = require('../utils/oauth');
const logger = require('../utils/logger');

/**
 * Facebook OAuth2 Service
 * Handles Facebook authentication flow with PKCE
 */

class FacebookOAuthService {
  constructor() {
    this.config = config.oauth.facebook;
    this.providerName = 'facebook';
  }

  /**
   * Generate Facebook OAuth authorization URL
   * @returns {Object} Authorization URL and PKCE params
   */
  getAuthorizationUrl() {
    try {
      // Create PKCE parameters
      const pkceParams = createPKCEParams();

      // Build authorization URL
      const authUrl = buildAuthorizationUrl(
        {
          clientId: this.config.appId,
          callbackUrl: this.config.callbackUrl,
          authorizationUrl: this.config.authorizationUrl,
          scopes: this.config.scopes,
        },
        pkceParams
      );

      logger.info({
        message: 'Generated Facebook OAuth URL',
        provider: this.providerName,
      });

      return {
        authUrl,
        pkceParams,
      };
    } catch (error) {
      logger.error({
        message: 'Failed to generate Facebook OAuth URL',
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
          client_id: this.config.appId,
          client_secret: this.config.appSecret,
          redirect_uri: this.config.callbackUrl,
          code_verifier: codeVerifier,
          provider: this.providerName,
        }
      );

      logger.info({
        message: 'Successfully exchanged code for Facebook token',
        provider: this.providerName,
      });

      return tokenResponse;
    } catch (error) {
      logger.error({
        message: 'Failed to exchange code for Facebook token',
        error: error.message,
      });
      throw error;
    }
  }

  /**
   * Get user profile from Facebook
   * @param {string} accessToken - Access token
   * @returns {Object} Normalized user profile
   */
  async getUserProfile(accessToken) {
    try {
      const profile = await fetchUserProfile(
        accessToken,
        this.config.userInfoUrl,
        {
          params: {
            fields: 'id,name,email,first_name,last_name,picture.type(large)',
          },
        }
      );

      // Normalize profile data
      const normalizedProfile = {
        providerId: profile.id,
        email: profile.email,
        name: profile.name,
        firstName: profile.first_name,
        lastName: profile.last_name,
        avatar: profile.picture?.data?.url || null,
        provider: this.providerName,
      };

      logger.info({
        message: 'Fetched Facebook user profile',
        provider: this.providerName,
        email: normalizedProfile.email,
      });

      return normalizedProfile;
    } catch (error) {
      logger.error({
        message: 'Failed to fetch Facebook user profile',
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

      logger.logAuthEvent('FACEBOOK_OAUTH_SUCCESS', {
        provider: this.providerName,
        email: userProfile.email,
      });

      return {
        profile: userProfile,
        tokens: {
          accessToken: tokenResponse.access_token,
          expiresIn: tokenResponse.expires_in,
          tokenType: tokenResponse.token_type,
        },
      };
    } catch (error) {
      logger.logAuthEvent('FACEBOOK_OAUTH_FAILURE', {
        provider: this.providerName,
        error: error.message,
      });
      throw error;
    }
  }

  /**
   * Verify Facebook access token
   * @param {string} accessToken - Access token to verify
   * @returns {Object} Token validation response
   */
  async verifyAccessToken(accessToken) {
    try {
      const axios = require('axios');
      const response = await axios.get(
        `https://graph.facebook.com/debug_token`,
        {
          params: {
            input_token: accessToken,
            access_token: `${this.config.appId}|${this.config.appSecret}`,
          },
        }
      );

      logger.info({
        message: 'Verified Facebook access token',
        provider: this.providerName,
        valid: response.data.data.is_valid,
      });

      return response.data.data;
    } catch (error) {
      logger.error({
        message: 'Failed to verify Facebook access token',
        error: error.message,
      });
      throw error;
    }
  }
}

module.exports = new FacebookOAuthService();
