const mongoose = require('mongoose');

/**
 * User Schema
 * Stores user profiles with support for multiple OAuth providers
 * Supports account linking/unlinking and role-based access control
 */
const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    avatar: {
      type: String,
      default: null,
    },
    roles: {
      type: [String],
      default: ['user'],
      enum: ['user', 'admin'],
    },
    // Array of linked OAuth providers
    providers: [
      {
        name: {
          type: String,
          required: true,
          enum: ['google', 'facebook'],
        },
        providerId: {
          type: String,
          required: true,
        },
        linkedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    // Store active sessions for revocation
    activeSessions: [
      {
        sessionId: String,
        createdAt: { type: Date, default: Date.now },
        expiresAt: Date,
        userAgent: String,
        ip: String,
      },
    ],
    lastLoginAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt
  }
);

/**
 * Index for efficient provider lookups
 */
userSchema.index({ 'providers.name': 1, 'providers.providerId': 1 });

/**
 * Find user by provider credentials
 * @param {string} providerName - 'google' or 'facebook'
 * @param {string} providerId - Provider-specific user ID
 */
userSchema.statics.findByProvider = async function (providerName, providerId) {
  return this.findOne({
    providers: {
      $elemMatch: {
        name: providerName,
        providerId: providerId,
      },
    },
  });
};

/**
 * Link a new provider to existing user account
 * @param {string} providerName - Provider to link
 * @param {string} providerId - Provider user ID
 */
userSchema.methods.linkProvider = async function (providerName, providerId) {
  // Check if provider already linked
  const alreadyLinked = this.providers.some(
    (p) => p.name === providerName && p.providerId === providerId
  );

  if (alreadyLinked) {
    throw new Error('Provider already linked to this account');
  }

  this.providers.push({
    name: providerName,
    providerId: providerId,
    linkedAt: new Date(),
  });

  return this.save();
};

/**
 * Unlink a provider from user account
 * @param {string} providerName - Provider to unlink
 */
userSchema.methods.unlinkProvider = async function (providerName) {
  // Prevent unlinking if it's the only provider
  if (this.providers.length === 1) {
    throw new Error('Cannot unlink the only authentication provider');
  }

  this.providers = this.providers.filter((p) => p.name !== providerName);
  return this.save();
};

/**
 * Add a new session
 */
userSchema.methods.addSession = async function (sessionId, expiresAt, userAgent, ip) {
  this.activeSessions.push({
    sessionId,
    expiresAt,
    userAgent,
    ip,
  });

  // Keep only the last 10 sessions
  if (this.activeSessions.length > 10) {
    this.activeSessions = this.activeSessions.slice(-10);
  }

  return this.save();
};

/**
 * Remove a session (logout)
 */
userSchema.methods.removeSession = async function (sessionId) {
  this.activeSessions = this.activeSessions.filter(
    (session) => session.sessionId !== sessionId
  );
  return this.save();
};

/**
 * Remove all sessions (logout from all devices)
 */
userSchema.methods.removeAllSessions = async function () {
  this.activeSessions = [];
  return this.save();
};

/**
 * Update last login timestamp
 */
userSchema.methods.updateLastLogin = async function () {
  this.lastLoginAt = new Date();
  return this.save();
};

/**
 * Sanitize user object for API responses
 * Remove sensitive fields
 */
userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.activeSessions;
  delete obj.__v;
  return obj;
};

const User = mongoose.model('User', userSchema);

module.exports = User;
