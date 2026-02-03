#!/usr/bin/env node

/**
 * Build Script with Logging
 * Build با لاگ‌گذاری کامل
 */
require('./load-env.js');

console.log('🏗️  [DEPLOY] Starting build process...');
console.log('📍 [DEPLOY] Location: build-with-logs.js');
console.log('⏰ [DEPLOY] Timestamp:', new Date().toISOString());

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const projectRoot = path.join(__dirname, '..');

// Step 1: Check environment
console.log('');
console.log('📋 [DEPLOY] Step 1: Environment check');
console.log('🌍 [DEPLOY] NODE_ENV:', process.env.NODE_ENV || 'NOT SET');
console.log('🌍 [DEPLOY] Working directory:', process.cwd());
console.log('🌍 [DEPLOY] Project root:', projectRoot);

// Step 2: Check required packages for build
console.log('');
console.log('📋 [DEPLOY] Step 2: Checking required packages');
const requiredPackages = [
  '@tailwindcss/postcss',
  'tailwindcss',
  '@prisma/client',
  'next'
];

let missingPackages = [];
requiredPackages.forEach(pkg => {
  try {
    require.resolve(pkg, { paths: [projectRoot] });
    console.log(`✅ [DEPLOY] ${pkg} is installed`);
  } catch (error) {
    missingPackages.push(pkg);
    console.error(`❌ [DEPLOY] ${pkg} is NOT installed`);
  }
});

if (missingPackages.length > 0) {
  console.error(`❌ [DEPLOY] Missing ${missingPackages.length} required package(s):`, missingPackages.join(', '));
  console.error('❌ [DEPLOY] These packages are needed for build but are in devDependencies');
  console.error('❌ [DEPLOY] Please move them to dependencies in package.json');
  process.exit(1);
}

// Step 3: Generate Prisma Client
console.log('');
console.log('📋 [DEPLOY] Step 3: Generating Prisma Client');
try {
  console.log('🔧 [DEPLOY] Running: npx prisma generate');
  execSync('npx prisma generate', {
    encoding: 'utf8',
    stdio: 'pipe',
    maxBuffer: 10 * 1024 * 1024,
    cwd: projectRoot,
    env: process.env
  });
  console.log('✅ [DEPLOY] Prisma Client generated successfully');
} catch (error) {
  console.error('❌ [DEPLOY] Failed to generate Prisma Client');
  console.error('❌ [DEPLOY] Error:', error.message);
  if (error.stdout) console.error('❌ [DEPLOY] Prisma stdout:', error.stdout);
  if (error.stderr) console.error('❌ [DEPLOY] Prisma stderr:', error.stderr);
  process.exit(1);
}

// Step 4: Verify Prisma Client was generated
const prismaClientPath = path.join(projectRoot, 'node_modules', '.prisma', 'client', 'index.js');
if (fs.existsSync(prismaClientPath)) {
  console.log('✅ [DEPLOY] Prisma Client file exists');
} else {
  console.error('❌ [DEPLOY] Prisma Client file not found at:', prismaClientPath);
  console.error('❌ [DEPLOY] Build will likely fail');
}

// Step 5: Build Next.js
console.log('');
console.log('📋 [DEPLOY] Step 5: Building Next.js application');
try {
  console.log('🏗️  [DEPLOY] Running: next build (using webpack for stability)');
  const startTime = Date.now();
  execSync('next build --webpack', {
    stdio: 'inherit',
    cwd: projectRoot,
    env: {
      ...process.env,
      NODE_ENV: 'production',
      NODE_OPTIONS: process.env.NODE_OPTIONS || '--max-old-space-size=2048'
    }
  });
  const buildTime = ((Date.now() - startTime) / 1000).toFixed(2);
  console.log(`✅ [DEPLOY] Build completed successfully in ${buildTime}s`);
} catch (error) {
  console.error('❌ [DEPLOY] Build failed');
  console.error('❌ [DEPLOY] Error code:', error.status || error.code);
  console.error('❌ [DEPLOY] Error message:', error.message);
  process.exit(1);
}

// Step 6: Verify build output
console.log('');
console.log('📋 [DEPLOY] Step 6: Verifying build output');
const nextBuildPath = path.join(projectRoot, '.next');
if (fs.existsSync(nextBuildPath)) {
  console.log('✅ [DEPLOY] .next directory exists');
  const staticPath = path.join(nextBuildPath, 'static');
  if (fs.existsSync(staticPath)) {
    console.log('✅ [DEPLOY] Static files generated');
  }
} else {
  console.error('❌ [DEPLOY] .next directory not found - build may have failed');
  process.exit(1);
}

console.log('');
console.log('✅ [DEPLOY] Build process completed successfully!');
console.log('⏰ [DEPLOY] Final timestamp:', new Date().toISOString());
