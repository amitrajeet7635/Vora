#!/usr/bin/env node

/**
 * Database Migration Script
 * Fixes users created with wrong field names (displayName -> name, avatarUrl -> avatar)
 * 
 * Run this if you get errors about null properties in DashboardPage
 */

const mongoose = require('mongoose');
require('dotenv').config();

async function migrate() {
  try {
    console.log('🔄 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    const db = mongoose.connection.db;
    const usersCollection = db.collection('users');

    // Find users with old field names
    console.log('🔍 Looking for users with old field structure...');
    const usersToFix = await usersCollection.find({
      $or: [
        { displayName: { $exists: true } },
        { avatarUrl: { $exists: true } },
        { 'providers.provider': { $exists: true } }
      ]
    }).toArray();

    if (usersToFix.length === 0) {
      console.log('✅ No users need fixing!');
      await mongoose.connection.close();
      return;
    }

    console.log(`📊 Found ${usersToFix.length} user(s) to fix\n`);

    for (const user of usersToFix) {
      console.log(`Fixing user: ${user.email || user._id}`);
      
      const updates = {};

      // Fix displayName -> name
      if (user.displayName) {
        updates.name = user.displayName;
        updates.$unset = { displayName: 1 };
        console.log(`  ✓ Renaming displayName to name`);
      }

      // Fix avatarUrl -> avatar
      if (user.avatarUrl) {
        updates.avatar = user.avatarUrl;
        if (!updates.$unset) updates.$unset = {};
        updates.$unset.avatarUrl = 1;
        console.log(`  ✓ Renaming avatarUrl to avatar`);
      }

      // Fix providers.provider -> providers.name
      if (user.providers && user.providers.length > 0) {
        const fixedProviders = user.providers.map(p => {
          if (p.provider) {
            return {
              name: p.provider,
              providerId: p.providerId,
              linkedAt: p.linkedAt || new Date()
            };
          }
          return p;
        });
        updates.providers = fixedProviders;
        console.log(`  ✓ Fixed providers array`);
      }

      // Apply updates
      await usersCollection.updateOne(
        { _id: user._id },
        updates
      );

      console.log(`  ✅ User fixed!\n`);
    }

    console.log('🎉 Migration completed successfully!');
    await mongoose.connection.close();
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  }
}

// Run migration
migrate();
