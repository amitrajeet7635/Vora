#!/usr/bin/env node

/**
 * Check Users Script
 * Shows what's in the database
 */

const mongoose = require('mongoose');
require('dotenv').config();

async function checkUsers() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    const db = mongoose.connection.db;
    const users = await db.collection('users').find({}).toArray();

    console.log(`📊 Found ${users.length} user(s) in database:\n`);

    users.forEach((user, i) => {
      console.log(`User ${i + 1}:`);
      console.log(`  ID: ${user._id}`);
      console.log(`  Email: ${user.email}`);
      console.log(`  Name: ${user.name || 'N/A'}`);
      console.log(`  DisplayName: ${user.displayName || 'N/A'}`);
      console.log(`  Avatar: ${user.avatar || 'N/A'}`);
      console.log(`  AvatarUrl: ${user.avatarUrl || 'N/A'}`);
      console.log(`  Providers:`, JSON.stringify(user.providers, null, 2));
      console.log();
    });

    await mongoose.connection.close();
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

checkUsers();
