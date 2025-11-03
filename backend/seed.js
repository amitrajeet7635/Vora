require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('./src/config/db');
const User = require('./src/models/User');
const logger = require('./src/utils/logger');

/**
 * Database Seed Script
 * Creates mock users for testing
 */

const mockUsers = [
  {
    name: 'John Doe',
    email: 'john.doe@example.com',
    avatar: 'https://ui-avatars.com/api/?name=John+Doe&size=200',
    roles: ['user'],
    providers: [
      {
        name: 'google',
        providerId: 'google_123456789',
      },
    ],
  },
  {
    name: 'Jane Smith',
    email: 'jane.smith@example.com',
    avatar: 'https://ui-avatars.com/api/?name=Jane+Smith&size=200',
    roles: ['user'],
    providers: [
      {
        name: 'facebook',
        providerId: 'facebook_987654321',
      },
    ],
  },
  {
    name: 'Admin User',
    email: 'admin@vora.com',
    avatar: 'https://ui-avatars.com/api/?name=Admin+User&size=200',
    roles: ['user', 'admin'],
    providers: [
      {
        name: 'google',
        providerId: 'google_admin_001',
      },
      {
        name: 'facebook',
        providerId: 'facebook_admin_001',
      },
    ],
  },
  {
    name: 'Test User',
    email: 'test@example.com',
    avatar: 'https://ui-avatars.com/api/?name=Test+User&size=200',
    roles: ['user'],
    providers: [
      {
        name: 'google',
        providerId: 'google_test_123',
      },
    ],
  },
];

/**
 * Seed Database
 */
const seedDatabase = async () => {
  try {
    console.log('🌱 Starting database seeding...\n');

    // Connect to database
    await connectDB();

    // Clear existing users
    const deleteCount = await User.deleteMany({});
    console.log(`🗑️  Deleted ${deleteCount.deletedCount} existing users\n`);

    // Create mock users
    const createdUsers = await User.insertMany(mockUsers);
    console.log(`✅ Created ${createdUsers.length} mock users:\n`);

    createdUsers.forEach((user, index) => {
      console.log(`${index + 1}. ${user.name} (${user.email})`);
      console.log(`   Providers: ${user.providers.map((p) => p.name).join(', ')}`);
      console.log(`   Roles: ${user.roles.join(', ')}`);
      console.log('');
    });

    console.log('✨ Database seeded successfully!\n');
    console.log('📋 Summary:');
    console.log(`   Total users: ${createdUsers.length}`);
    console.log(`   Regular users: ${createdUsers.filter((u) => !u.roles.includes('admin')).length}`);
    console.log(`   Admin users: ${createdUsers.filter((u) => u.roles.includes('admin')).length}`);
    console.log('');

    // Close connection
    await mongoose.connection.close();
    console.log('👋 Database connection closed\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    logger.error({
      message: 'Database seeding failed',
      error: error.message,
      stack: error.stack,
    });
    process.exit(1);
  }
};

// Run seed
seedDatabase();
