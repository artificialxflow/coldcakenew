#!/usr/bin/env node

/**
 * Initialization Script
 * اجرای چک‌های اولیه و تست اتصال قبل از start
 */

console.log('🚀 [DEPLOY] Running initialization checks...');
console.log('📍 [DEPLOY] Location: init.js');
console.log('⏰ [DEPLOY] Timestamp:', new Date().toISOString());

const path = require('path');
const { PrismaClient } = require('@prisma/client');

(async () => {
  // Check environment variables
  console.log('');
  console.log('📋 [DEPLOY] Checking environment variables...');
  const requiredVars = ['DATABASE_URL', 'JWT_SECRET'];
  const missingVars = [];
  
  requiredVars.forEach(varName => {
    if (process.env[varName]) {
      console.log(`✅ [DEPLOY] ${varName}: SET`);
    } else {
      console.error(`❌ [DEPLOY] ${varName}: NOT SET`);
      missingVars.push(varName);
    }
  });

  if (missingVars.length > 0) {
    console.error(`❌ [DEPLOY] Missing required variables: ${missingVars.join(', ')}`);
    console.error('❌ [DEPLOY] Application may not work correctly');
  }

  // Test database connection
  console.log('');
  console.log('📋 [DEPLOY] Testing database connection...');
  const prisma = new PrismaClient({ log: ['error'] });
  
  try {
    await prisma.$connect();
    console.log('✅ [DEPLOY] Database connection successful');
    
    // Test query
    const userCount = await prisma.user.count();
    console.log(`✅ [DEPLOY] Database is accessible (User count: ${userCount})`);
  } catch (error) {
    console.error('❌ [DEPLOY] Database connection failed');
    console.error('❌ [DEPLOY] Error:', error.message);
    if (error.code === 'P1001') {
      console.error('❌ [DEPLOY] Cannot reach database server');
      console.error('❌ [DEPLOY] Please check DATABASE_URL');
    }
    // Don't exit - let the app try to start anyway
  } finally {
    await prisma.$disconnect();
  }

  // Check Prisma Client
  console.log('');
  console.log('📋 [DEPLOY] Checking Prisma Client...');
  const fs = require('fs');
  const prismaClientPath = path.join(__dirname, '..', 'node_modules', '.prisma', 'client', 'index.js');
  if (fs.existsSync(prismaClientPath)) {
    console.log('✅ [DEPLOY] Prisma Client exists');
  } else {
    console.error('❌ [DEPLOY] Prisma Client not found');
    console.error('❌ [DEPLOY] Run: npx prisma generate');
  }

  console.log('');
  console.log('✅ [DEPLOY] Initialization checks completed');
  console.log('⏰ [DEPLOY] Ready timestamp:', new Date().toISOString());
})();
