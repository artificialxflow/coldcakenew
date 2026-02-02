#!/usr/bin/env node

/**
 * Kill Port Script
 * پیدا کردن و kill کردن process روی یک port خاص
 */

console.log('🔍 [DEPLOY] Checking port usage...');
console.log('📍 [DEPLOY] Location: kill-port.js');
console.log('⏰ [DEPLOY] Timestamp:', new Date().toISOString());

const { execSync } = require('child_process');

const port = process.env.PORT || 3000;
console.log(`🔍 [DEPLOY] Checking port: ${port}`);

try {
  // Method 1: Using lsof (Linux/Mac)
  try {
    console.log('🔍 [DEPLOY] Trying lsof method...');
    const result = execSync(`lsof -ti:${port}`, { encoding: 'utf8', stdio: 'pipe' }).trim();
    if (result) {
      const pids = result.split('\n').filter(pid => pid.trim());
      console.log(`⚠️  [DEPLOY] Found ${pids.length} process(es) using port ${port}`);
      pids.forEach(pid => {
        console.log(`  📌 [DEPLOY] PID: ${pid}`);
        try {
          execSync(`kill -9 ${pid}`, { stdio: 'inherit' });
          console.log(`✅ [DEPLOY] Killed process ${pid}`);
        } catch (error) {
          console.error(`❌ [DEPLOY] Failed to kill process ${pid}:`, error.message);
        }
      });
      console.log(`✅ [DEPLOY] Port ${port} should now be free`);
    } else {
      console.log(`✅ [DEPLOY] Port ${port} is free (no process found)`);
    }
  } catch (error) {
    if (error.status === 1) {
      // lsof returns 1 when no process is found
      console.log(`✅ [DEPLOY] Port ${port} is free (lsof found nothing)`);
    } else {
      // lsof not available, try other method
      throw error;
    }
  }
} catch (error) {
  // Method 2: Using fuser (alternative)
  try {
    console.log('🔍 [DEPLOY] Trying fuser method...');
    execSync(`fuser -k ${port}/tcp`, { stdio: 'inherit' });
    console.log(`✅ [DEPLOY] Port ${port} should now be free (fuser)`);
  } catch (error2) {
    // Method 3: Using netstat + kill
    try {
      console.log('🔍 [DEPLOY] Trying netstat method...');
      const netstatResult = execSync(`netstat -tlnp | grep :${port}`, { encoding: 'utf8', stdio: 'pipe' }).trim();
      if (netstatResult) {
        console.log(`⚠️  [DEPLOY] Found processes using port ${port}`);
        const lines = netstatResult.split('\n');
        lines.forEach(line => {
          const match = line.match(/(\d+)\/node/);
          if (match) {
            const pid = match[1];
            console.log(`  📌 [DEPLOY] Found Node process PID: ${pid}`);
            try {
              execSync(`kill -9 ${pid}`, { stdio: 'inherit' });
              console.log(`✅ [DEPLOY] Killed Node process ${pid}`);
            } catch (error3) {
              console.error(`❌ [DEPLOY] Failed to kill process ${pid}:`, error3.message);
            }
          }
        });
      } else {
        console.log(`✅ [DEPLOY] Port ${port} is free (netstat found nothing)`);
      }
    } catch (error3) {
      console.error('❌ [DEPLOY] Could not check/kill port using any method');
      console.error('❌ [DEPLOY] Please manually kill the process using:');
      console.error(`   lsof -ti:${port} | xargs kill -9`);
      console.error(`   or`);
      console.error(`   fuser -k ${port}/tcp`);
      process.exit(1);
    }
  }
}

console.log('✅ [DEPLOY] Port check/kill completed');
console.log('');
