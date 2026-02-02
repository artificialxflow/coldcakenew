#!/usr/bin/env node

/**
 * Post-install Check Script
 * بررسی و لاگ کردن پس از نصب dependencies
 */

console.log('📦 [DEPLOY] Running post-install checks...');
console.log('📍 [DEPLOY] Location: postinstall-check.js');
console.log('⏰ [DEPLOY] Timestamp:', new Date().toISOString());

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Check if node_modules exists
const nodeModulesPath = path.join(__dirname, '..', 'node_modules');
if (fs.existsSync(nodeModulesPath)) {
  console.log('✅ [DEPLOY] node_modules directory exists');
  try {
    const packages = fs.readdirSync(nodeModulesPath).filter(p => !p.startsWith('.'));
    console.log(`📦 [DEPLOY] Found ${packages.length} installed packages`);
  } catch (error) {
    console.warn('⚠️  [DEPLOY] Could not list packages:', error.message);
  }
} else {
  console.warn('⚠️  [DEPLOY] node_modules directory not found - dependencies may not be installed');
}

// Check critical dependencies
const criticalDeps = ['next', '@prisma/client', 'react', 'react-dom'];
criticalDeps.forEach(dep => {
  const depPath = path.join(nodeModulesPath, dep);
  if (fs.existsSync(depPath)) {
    console.log(`✅ [DEPLOY] ${dep} is installed`);
  } else {
    console.error(`❌ [DEPLOY] ${dep} is NOT installed`);
  }
});

// Try to generate Prisma Client
console.log('🔧 [DEPLOY] Attempting to generate Prisma Client...');
try {
  execSync('npx prisma generate', { 
    stdio: 'inherit',
    cwd: path.join(__dirname, '..'),
    env: process.env
  });
  console.log('✅ [DEPLOY] Prisma Client generated successfully');
} catch (error) {
  console.error('❌ [DEPLOY] Failed to generate Prisma Client:', error.message);
  console.error('❌ [DEPLOY] This may cause build or runtime errors');
  // Don't exit - postinstall should not fail the install
}

console.log('📦 [DEPLOY] Post-install checks completed.');
console.log('');
