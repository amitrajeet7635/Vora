const crypto = require('crypto');
const axios = require('axios');
const logger = require('./logger');

/**
 * OAuth2 PKCE Utility Functions
 * Implements Proof Key for Code Exchange (RFC 7636)
 * Provides state/nonce generation and token exchange helpers
 */

/**
 * Generate cryptographically secure random string
 * @param {number} length - Length of the string
 * @returns {string} Base64 URL-encoded random string
 */
const generateRandomString = (length = 32) => {
  return crypto.randomBytes(length).toString('base64url');
};

/**
 * Generate PKCE code verifier
 * A high-entropy cryptographic random string
 * @returns {string} Code verifier (43-128 characters)
 */
const generateCodeVerifier = () => {
  return generateRandomString(32); // 43 characters in base64url
};

/**
 * Generate PKCE code challenge from verifier
 * SHA256 hash of the code verifier
 * @param {string} verifier - Code verifier
 * @returns {string} Base64 URL-encoded SHA256 hash
 */
const generateCodeChallenge = (verifier) => {
  return crypto
    .createHash('sha256')
    .update(verifier)
    .digest('base64url');
};

/**
 * Generate state parameter for CSRF protection
 * @returns {string} Random state string
 */
const generateState = () => {
  return generateRandomString(32);
};

/**
 * Generate nonce for replay attack protection
 * @returns {string} Random nonce string
 */
const generateNonce = () => {
  return generateRandomString(16);
};

/**
 * Create PKCE parameters
 * @returns {Object} Object containing verifier, challenge, state, and nonce
 */
const createPKCEParams = () => {
  const codeVerifier = generateCodeVerifier();
  const codeChallenge = generateCodeChallenge(codeVerifier);
  const state = generateState();
  const nonce = generateNonce();

  return {
    codeVerifier,
    codeChallenge,
    state,
    nonce,
  };
};

/**
 * Validate state parameter to prevent CSRF attacks
 * @param {string} receivedState - State from callback
 * @param {string} storedState - State stored in session/cookie
 * @returns {boolean} True if states match
 */
const validateState = (receivedState, storedState) => {
  if (!receivedState || !storedState) {
    logger.warn('Missing state parameter in OAuth callback');
    return false;
  }

  // Use constant-time comparison to prevent timing attacks
  try {
    return crypto.timingSafeEqual(
      Buffer.from(receivedState),
      Buffer.from(storedState)
    );
  } catch (error) {
    logger.warn({
      message: 'State validation failed',
      error: error.message,
    });
    return false;
  }
};

/**
 * Exchange authorization code for access token
 * @param {string} code - Authorization code
 * @param {string} tokenUrl - Provider's token endpoint
 * @param {Object} params - Token exchange parameters
 * @returns {Object} Token response
 */
const exchangeCodeForToken = async (code, tokenUrl, params) => {
  try {
    const response = await axios.post(
      tokenUrl,
      new URLSearchParams({
        code,
        ...params,
      }).toString(),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        timeout: 10000, // 10 second timeout
      }
    );

    if (!response.data || !response.data.access_token) {
      throw new Error('Invalid token response from provider');
    }

    return response.data;
  } catch (error) {
    logger.error({
      message: 'Token exchange failed',
      provider: params.provider || 'unknown',
      error: error.response?.data || error.message,
      status: error.response?.status,
    });

    if (error.response?.data) {
      throw new Error(
        error.response.data.error_description ||
          error.response.data.error ||
          'Token exchange failed'
      );
    }

    throw new Error('Failed to exchange authorization code for token');
  }
};

/**
 * Fetch user profile from OAuth provider
 * @param {string} accessToken - OAuth access token
 * @param {string} userInfoUrl - Provider's user info endpoint
 * @param {Object} options - Additional options (headers, params)
 * @returns {Object} User profile data
 */
const fetchUserProfile = async (accessToken, userInfoUrl, options = {}) => {
  try {
    const response = await axios.get(userInfoUrl, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        ...options.headers,
      },
      params: options.params || {},
      timeout: 10000,
    });

    if (!response.data) {
      throw new Error('Invalid user profile response');
    }

    return response.data;
  } catch (error) {
    logger.error({
      message: 'Failed to fetch user profile',
      error: error.response?.data || error.message,
      status: error.response?.status,
    });

    throw new Error('Failed to fetch user profile from provider');
  }
};

/**
 * Build authorization URL with PKCE parameters
 * @param {Object} config - OAuth provider configuration
 * @param {Object} pkceParams - PKCE parameters
 * @returns {string} Authorization URL
 */
const buildAuthorizationUrl = (config, pkceParams) => {
  const params = new URLSearchParams({
    client_id: config.clientId,
    redirect_uri: config.callbackUrl,
    response_type: 'code',
    scope: config.scopes.join(' '),
    state: pkceParams.state,
    code_challenge: pkceParams.codeChallenge,
    code_challenge_method: 'S256',
    nonce: pkceParams.nonce,
  });

  // Add provider-specific parameters
  if (config.accessType) {
    params.append('access_type', config.accessType);
  }

  if (config.prompt) {
    params.append('prompt', config.prompt);
  }

  return `${config.authorizationUrl}?${params.toString()}`;
};

/**
 * Parse OAuth error from callback
 * @param {Object} query - Query parameters from callback
 * @returns {Object|null} Error object or null
 */
const parseOAuthError = (query) => {
  if (query.error) {
    return {
      error: query.error,
      description: query.error_description || 'OAuth authentication failed',
      uri: query.error_uri,
    };
  }
  return null;
};

/**
 * Store PKCE session data (in-memory store for demo)
 * In production, use Redis or similar
 */
const sessionStore = new Map();

/**
 * Save PKCE session
 * @param {string} state - State parameter (used as key)
 * @param {Object} data - Session data to store
 * @param {number} ttl - Time to live in milliseconds (default 10 minutes)
 */
const savePKCESession = (state, data, ttl = 10 * 60 * 1000) => {
  sessionStore.set(state, {
    ...data,
    expiresAt: Date.now() + ttl,
  });

  // Auto-cleanup after TTL
  setTimeout(() => {
    sessionStore.delete(state);
  }, ttl);
};

/**
 * Retrieve PKCE session
 * @param {string} state - State parameter (key)
 * @returns {Object|null} Session data or null
 */
const getPKCESession = (state) => {
  const session = sessionStore.get(state);

  if (!session) {
    return null;
  }

  // Check expiration
  if (session.expiresAt < Date.now()) {
    sessionStore.delete(state);
    return null;
  }

  return session;
};

/**
 * Delete PKCE session
 * @param {string} state - State parameter (key)
 */
const deletePKCESession = (state) => {
  sessionStore.delete(state);
};

/**
 * Clear expired sessions (cleanup job)
 */
const clearExpiredSessions = () => {
  const now = Date.now();
  for (const [state, session] of sessionStore.entries()) {
    if (session.expiresAt < now) {
      sessionStore.delete(state);
    }
  }
};

// Run cleanup every 5 minutes
setInterval(clearExpiredSessions, 5 * 60 * 1000);

module.exports = {
  generateRandomString,
  generateCodeVerifier,
  generateCodeChallenge,
  generateState,
  generateNonce,
  createPKCEParams,
  validateState,
  exchangeCodeForToken,
  fetchUserProfile,
  buildAuthorizationUrl,
  parseOAuthError,
  savePKCESession,
  getPKCESession,
  deletePKCESession,
  clearExpiredSessions,
};
