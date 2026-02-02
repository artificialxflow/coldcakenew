#!/usr/bin/env node

/**
 * Health Check Script
 * بررسی وضعیت سیستم و دیتابیس
 */

console.log('🏥 [DEPLOY] Running health check...');
console.log('📍 [DEPLOY] Location: health-check.js');
console.log('⏰ [DEPLOY] Timestamp:', new Date().toISOString());

const path = require('path');

// Check environment
console.log('');
console.log('📋 [DEPLOY] Environment Check');
console.log('🌍 [DEPLOY] NODE_ENV:', process.env.NODE_ENV || 'NOT SET');
console.log('🌍 [DEPLOY] PORT:', process.env.PORT || '3000 (default)');

// Check database connection
console.log('');
console.log('📋 [DEPLOY] Database Connection Check');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient({
  log: ['error'],
});

(async () => {
  try {
    console.log('🔌 [DEPLOY] Attempting to connect to database...');
    await prisma.$connect();
    console.log('✅ [DEPLOY] Database connection successful');
    
    // Test a simple query
    const userCount = await prisma.user.count();
    console.log(`✅ [DEPLOY] Database query successful (User count: ${userCount})`);
  } catch (error) {
    console.error('❌ [DEPLOY] Database connection failed');
    console.error('❌ [DEPLOY] Error:', error.message);
    if (error.code === 'P1001') {
      console.error('❌ [DEPLOY] Cannot reach database server');
      console.error('❌ [DEPLOY] Check DATABASE_URL:', process.env.DATABASE_URL ? 'SET' : 'NOT SET');
    }
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
})();
