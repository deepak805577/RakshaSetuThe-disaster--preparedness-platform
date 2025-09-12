#!/usr/bin/env ts-node
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../../env.example') });

import { seedAllModules } from '../services/seedData';
import connectDB from '../config/database';

const seedDatabase = async () => {
  try {
    console.log('🌱 Starting database seeding process...');
    
    // Connect to database
    await connectDB();
    console.log('✅ Connected to database');
    
    // Seed all modules and data
    await seedAllModules();
    
    console.log('🎉 Database seeding completed successfully!');
    console.log('\n📊 Summary of seeded data:');
    console.log('   • Earthquake Preparedness Module');
    console.log('   • Flood Safety Module'); 
    console.log('   • Fire Safety Module');
    console.log('   • Cyclone Preparedness Module');
    console.log('   • Heatwave Safety Module');
    console.log('   • Drought Preparedness Module');
    console.log('   • Gamification Badges');
    console.log('   • Emergency Contacts for Punjab Districts');
    console.log('   • Demo User Accounts');
    
    console.log('\n👥 Demo Login Credentials:');
    console.log('   Admin:   admin@demo.com   / admin123');
    console.log('   Teacher: teacher@demo.com / teacher123');
    console.log('   Student: student@demo.com / student123');
    console.log('   Parent:  parent@demo.com  / parent123');
    
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
};

// Handle unhandled promise rejections
process.on('unhandledRejection', (err: Error) => {
  console.error('Unhandled Promise Rejection:', err.message);
  process.exit(1);
});

// Run seeding
seedDatabase();
