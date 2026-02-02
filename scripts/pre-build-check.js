#!/usr/bin/env node

/**
 * Pre-build Check Script
 * بررسی محیط و متغیرهای ضروری قبل از build
 */
require('./load-env.js');

console.log('🔍 [DEPLOY] Starting pre-build checks...');
console.log('📍 [DEPLOY] Location: pre-build-check.js');
console.log('⏰ [DEPLOY] Timestamp:', new Date().toISOString());

// Check Node version
const nodeVersion = process.version;
console.log('📦 [DEPLOY] Node version:', nodeVersion);

// Check NPM version
const { execSync } = require('child_process');
try {
  const npmVersion = execSync('npm --version', { encoding: 'utf8' }).trim();
  console.log('📦 [DEPLOY] NPM version:', npmVersion);
} catch (error) {
  console.error('❌ [DEPLOY] Failed to get NPM version:', error.message);
}

// Check critical environment variables
const requiredEnvVars = [
  'DATABASE_URL',
  'JWT_SECRET',
];

const missingVars = [];
requiredEnvVars.forEach(varName => {
  if (!process.env[varName]) {
    missingVars.push(varName);
    console.warn(`⚠️  [DEPLOY] Missing environment variable: ${varName}`);
  } else {
    const value = varName === 'DATABASE_URL' 
      ? process.env[varName].replace(/:[^:@]+@/, ':****@') // Hide password
      : varName === 'JWT_SECRET'
      ? '****' // Hide secret
      : process.env[varName];
    console.log(`✅ [DEPLOY] Found ${varName}: ${value ? 'SET' : 'EMPTY'}`);
  }
});

// Check NODE_ENV
const nodeEnv = process.env.NODE_ENV;
console.log('🌍 [DEPLOY] NODE_ENV:', nodeEnv || 'NOT SET');
if (nodeEnv && nodeEnv !== 'production' && nodeEnv !== 'development') {
  console.warn(`⚠️  [DEPLOY] Non-standard NODE_ENV value: ${nodeEnv}`);
}

// Check if Prisma schema exists
const fs = require('fs');
const path = require('path');
const schemaPath = path.join(__dirname, '..', 'prisma', 'schema.prisma');
if (fs.existsSync(schemaPath)) {
  console.log('✅ [DEPLOY] Prisma schema found');
  const schemaContent = fs.readFileSync(schemaPath, 'utf8');
  const modelCount = (schemaContent.match(/^model /gm) || []).length;
  console.log(`📊 [DEPLOY] Found ${modelCount} models in schema`);
} else {
  console.error('❌ [DEPLOY] Prisma schema not found at:', schemaPath);
  process.exit(1);
}

// Check if migrations exist
const migrationsPath = path.join(__dirname, '..', 'prisma', 'migrations');
if (fs.existsSync(migrationsPath)) {
  const migrations = fs.readdirSync(migrationsPath).filter(f => 
    fs.statSync(path.join(migrationsPath, f)).isDirectory() && f !== 'node_modules'
  );
  console.log(`✅ [DEPLOY] Found ${migrations.length} migration(s)`);
  migrations.forEach(migration => {
    console.log(`  📝 [DEPLOY] Migration: ${migration}`);
  });
} else {
  console.warn('⚠️  [DEPLOY] Migrations directory not found');
}

// Check package.json
const packagePath = path.join(__dirname, '..', 'package.json');
if (fs.existsSync(packagePath)) {
  const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
  console.log('✅ [DEPLOY] package.json found');
  console.log(`📦 [DEPLOY] Package name: ${packageJson.name}`);
  console.log(`📦 [DEPLOY] Package version: ${packageJson.version}`);
} else {
  console.error('❌ [DEPLOY] package.json not found');
  process.exit(1);
}

// Summary
if (missingVars.length > 0) {
  console.error(`❌ [DEPLOY] Missing ${missingVars.length} required environment variable(s):`, missingVars.join(', '));
  console.error('❌ [DEPLOY] Build may fail. Please set required environment variables.');
} else {
  console.log('✅ [DEPLOY] All pre-build checks passed!');
}

console.log('🔍 [DEPLOY] Pre-build checks completed.');
console.log('');
