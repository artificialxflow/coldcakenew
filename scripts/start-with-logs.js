#!/usr/bin/env node

/**
 * Start Script with Logging
 * Start با لاگ‌گذاری کامل
 */

console.log('🚀 [DEPLOY] Starting application...');
console.log('📍 [DEPLOY] Location: start-with-logs.js');
console.log('⏰ [DEPLOY] Timestamp:', new Date().toISOString());

const { execSync, spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
const net = require('net');

const projectRoot = path.join(__dirname, '..');

// Pre-start checks
console.log('');
console.log('📋 [DEPLOY] Pre-start checks');

// Check if build exists
const nextBuildPath = path.join(projectRoot, '.next');
if (!fs.existsSync(nextBuildPath)) {
  console.error('❌ [DEPLOY] .next directory not found - application was not built');
  console.error('❌ [DEPLOY] Please run: npm run build');
  process.exit(1);
}
console.log('✅ [DEPLOY] Build directory exists');

// Check if Prisma Client exists
const prismaClientPath = path.join(projectRoot, 'node_modules', '.prisma', 'client', 'index.js');
if (!fs.existsSync(prismaClientPath)) {
  console.warn('⚠️  [DEPLOY] Prisma Client not found - attempting to generate...');
  try {
    execSync('npx prisma generate', {
      stdio: 'inherit',
      cwd: projectRoot,
      env: process.env
    });
    console.log('✅ [DEPLOY] Prisma Client generated');
  } catch (error) {
    console.error('❌ [DEPLOY] Failed to generate Prisma Client:', error.message);
  }
} else {
  console.log('✅ [DEPLOY] Prisma Client exists');
}

// Check environment variables
console.log('');
console.log('📋 [DEPLOY] Environment check');
const criticalEnvVars = ['DATABASE_URL', 'JWT_SECRET'];
let hasCriticalVars = true;
criticalEnvVars.forEach(varName => {
  if (process.env[varName]) {
    console.log(`✅ [DEPLOY] ${varName}: SET`);
  } else {
    console.error(`❌ [DEPLOY] ${varName}: NOT SET`);
    hasCriticalVars = false;
  }
});

if (!hasCriticalVars) {
  console.error('❌ [DEPLOY] Missing critical environment variables');
  console.error('❌ [DEPLOY] Application may not work correctly');
}

// Check port
const port = process.env.PORT || 3000;
console.log('');
console.log(`🌐 [DEPLOY] Starting on port: ${port}`);

// Check if port is in use
const checkPort = (port) => {
  return new Promise((resolve) => {
    const server = net.createServer();
    server.listen(port, () => {
      server.once('close', () => resolve(false));
      server.close();
    });
    server.on('error', () => resolve(true));
  });
};

// Verify port is actually listening and accepting connections
const verifyPortListening = (port) => {
  return new Promise((resolve) => {
    const client = net.createConnection({ port, host: 'localhost' }, () => {
      client.end();
      resolve(true);
    });
    client.on('error', (error) => {
      console.error(`⚠️  [DEPLOY] Port ${port} connection test failed:`, error.message);
      resolve(false);
    });
    // Timeout after 3 seconds
    setTimeout(() => {
      client.destroy();
      resolve(false);
    }, 3000);
  });
};

checkPort(port).then(portInUse => {
  if (portInUse) {
    console.warn(`⚠️  [DEPLOY] Port ${port} appears to be in use`);
    console.log(`🔍 [DEPLOY] Attempting to free port ${port}...`);
    
    // Try to kill the process using the port
    try {
      // Method 1: lsof
      try {
        const result = execSync(`lsof -ti:${port}`, { encoding: 'utf8', stdio: 'pipe' }).trim();
        if (result) {
          const pids = result.split('\n').filter(pid => pid.trim());
          console.log(`🔍 [DEPLOY] Found ${pids.length} process(es) using port ${port}`);
          pids.forEach(pid => {
            try {
              execSync(`kill -9 ${pid}`, { stdio: 'pipe' });
              console.log(`✅ [DEPLOY] Killed process ${pid} on port ${port}`);
            } catch (error) {
              console.warn(`⚠️  [DEPLOY] Could not kill process ${pid}:`, error.message);
            }
          });
          // Wait a bit for port to be freed
          setTimeout(() => {
            console.log(`✅ [DEPLOY] Port ${port} should now be free`);
            startNextJs(port);
          }, 1000);
          return;
        }
      } catch (error) {
        // lsof not available or no process found, try fuser
      }
      
      // Method 2: fuser
      try {
        execSync(`fuser -k ${port}/tcp`, { stdio: 'pipe' });
        console.log(`✅ [DEPLOY] Killed process on port ${port} using fuser`);
        setTimeout(() => {
          startNextJs(port);
        }, 1000);
        return;
      } catch (error) {
        // fuser not available
      }
      
      console.warn(`⚠️  [DEPLOY] Could not automatically free port ${port}`);
      console.warn(`⚠️  [DEPLOY] Please manually kill the process or use: node scripts/kill-port.js`);
      console.warn(`⚠️  [DEPLOY] Attempting to start anyway...`);
    } catch (error) {
      console.warn(`⚠️  [DEPLOY] Error freeing port:`, error.message);
      console.warn(`⚠️  [DEPLOY] Attempting to start anyway...`);
    }
    startNextJs(port);
  } else {
    console.log(`✅ [DEPLOY] Port ${port} is available`);
    startNextJs(port);
  }
});

function startNextJs(port) {

  // Start Next.js
  console.log('');
  console.log('📋 [DEPLOY] Starting Next.js server');
  console.log('🚀 [DEPLOY] Command: next start');
  console.log(`🌍 [DEPLOY] NODE_ENV: ${process.env.NODE_ENV || 'production'}`);
  console.log(`🌐 [DEPLOY] PORT: ${port}`);
  console.log('');

  // #region agent log
  fetch('http://127.0.0.1:7262/ingest/60585c9d-40fa-40a1-b59b-bcde38dab411',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'scripts/start-with-logs.js:147',message:'Starting Next.js process',data:{port,nodeEnv:process.env.NODE_ENV || 'production',hasDbUrl:!!process.env.DATABASE_URL,hasJwtSecret:!!process.env.JWT_SECRET},timestamp:Date.now(),sessionId:'deploy-debug',runId:'start',hypothesisId:'nextjs-start'})}).catch(()=>{});
  // #endregion

  let serverStarted = false;
  let serverStartTime = Date.now();

  const nextProcess = spawn('next', ['start'], {
    cwd: projectRoot,
    env: {
      ...process.env,
      NODE_ENV: process.env.NODE_ENV || 'production',
      PORT: port
    },
    stdio: ['ignore', 'pipe', 'pipe'], // Capture stdout and stderr
    shell: true
  });

  // Capture stdout
  nextProcess.stdout.on('data', (data) => {
    const output = data.toString();
    process.stdout.write(output); // Forward to parent stdout
    
    // #region agent log
    fetch('http://127.0.0.1:7262/ingest/60585c9d-40fa-40a1-b59b-bcde38dab411',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'scripts/start-with-logs.js:166',message:'Next.js stdout',data:{output:output.substring(0,500)},timestamp:Date.now(),sessionId:'deploy-debug',runId:'start',hypothesisId:'nextjs-stdout'})}).catch(()=>{});
    // #endregion

    // Check for server ready messages
    if (output.includes('Ready on') || output.includes('started server') || output.includes(`Local:`) || output.includes('started')) {
      if (!serverStarted) {
        serverStarted = true;
        const startupTime = ((Date.now() - serverStartTime) / 1000).toFixed(2);
        console.log(`✅ [DEPLOY] Next.js server started successfully in ${startupTime}s`);
        // #region agent log
        fetch('http://127.0.0.1:7262/ingest/60585c9d-40fa-40a1-b59b-bcde38dab411',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'scripts/start-with-logs.js:182',message:'Next.js server confirmed started',data:{startupTime,port},timestamp:Date.now(),sessionId:'deploy-debug',runId:'start',hypothesisId:'server-ready'})}).catch(()=>{});
        // #endregion
        
        // Verify port is actually listening
        setTimeout(() => {
          verifyPortListening(port).then(isListening => {
            if (isListening) {
              console.log(`✅ [DEPLOY] Port ${port} is confirmed listening and accepting connections`);
              // #region agent log
              fetch('http://127.0.0.1:7262/ingest/60585c9d-40fa-40a1-b59b-bcde38dab411',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'scripts/start-with-logs.js:190',message:'Port verification successful',data:{port},timestamp:Date.now(),sessionId:'deploy-debug',runId:'start',hypothesisId:'port-verify'})}).catch(()=>{});
              // #endregion
            } else {
              console.error(`❌ [DEPLOY] Port ${port} is NOT accepting connections`);
              // #region agent log
              fetch('http://127.0.0.1:7262/ingest/60585c9d-40fa-40a1-b59b-bcde38dab411',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'scripts/start-with-logs.js:195',message:'Port verification failed',data:{port},timestamp:Date.now(),sessionId:'deploy-debug',runId:'start',hypothesisId:'port-verify-fail'})}).catch(()=>{});
              // #endregion
            }
          });
        }, 2000); // Wait 2 seconds after "ready" message
      }
    }

    // Check for WebSocket errors
    if (output.includes('no close frame') || output.includes('WebSocket') || output.includes('Error On Connecting')) {
      console.error('❌ [DEPLOY] WebSocket connection error detected');
      // #region agent log
      fetch('http://127.0.0.1:7262/ingest/60585c9d-40fa-40a1-b59b-bcde38dab411',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'scripts/start-with-logs.js:183',message:'WebSocket error detected',data:{output:output.substring(0,500)},timestamp:Date.now(),sessionId:'deploy-debug',runId:'start',hypothesisId:'websocket-error'})}).catch(()=>{});
      // #endregion
    }
  });

  // Capture stderr
  nextProcess.stderr.on('data', (data) => {
    const output = data.toString();
    process.stderr.write(output); // Forward to parent stderr
    
    // #region agent log
    fetch('http://127.0.0.1:7262/ingest/60585c9d-40fa-40a1-b59b-bcde38dab411',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'scripts/start-with-logs.js:192',message:'Next.js stderr',data:{output:output.substring(0,500)},timestamp:Date.now(),sessionId:'deploy-debug',runId:'start',hypothesisId:'nextjs-stderr'})}).catch(()=>{});
    // #endregion

    console.error(`❌ [DEPLOY] Next.js stderr: ${output}`);
  });

  nextProcess.on('error', (error) => {
    console.error('❌ [DEPLOY] Failed to spawn Next.js process');
    console.error('❌ [DEPLOY] Error:', error.message);
    console.error('❌ [DEPLOY] Error code:', error.code);
    // #region agent log
    fetch('http://127.0.0.1:7262/ingest/60585c9d-40fa-40a1-b59b-bcde38dab411',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'scripts/start-with-logs.js:201',message:'Next.js spawn error',data:{error:error.message,code:error.code},timestamp:Date.now(),sessionId:'deploy-debug',runId:'start',hypothesisId:'spawn-error'})}).catch(()=>{});
    // #endregion
    if (error.message.includes('EADDRINUSE')) {
      console.error(`❌ [DEPLOY] Port ${port} is still in use`);
      console.error(`❌ [DEPLOY] Run: node scripts/kill-port.js`);
      console.error(`❌ [DEPLOY] Or manually: lsof -ti:${port} | xargs kill -9`);
    }
    process.exit(1);
  });

  nextProcess.on('exit', (code, signal) => {
    console.log('');
    console.log(`📋 [DEPLOY] Next.js process exited`);
    console.log(`📋 [DEPLOY] Exit code: ${code}`);
    console.log(`📋 [DEPLOY] Signal: ${signal || 'none'}`);
    console.log(`📋 [DEPLOY] Server was started: ${serverStarted}`);
    // #region agent log
    fetch('http://127.0.0.1:7262/ingest/60585c9d-40fa-40a1-b59b-bcde38dab411',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'scripts/start-with-logs.js:229',message:'Next.js process exited',data:{code,signal,serverStarted},timestamp:Date.now(),sessionId:'deploy-debug',runId:'start',hypothesisId:'process-exit'})}).catch(()=>{});
    // #endregion
    if (code !== 0 && code !== null) {
      console.error(`❌ [DEPLOY] Next.js process exited with non-zero code ${code}`);
      if (!serverStarted) {
        console.error('❌ [DEPLOY] Server never successfully started');
        console.error('❌ [DEPLOY] This may cause Kubernetes startup probe to fail');
      }
      process.exit(code || 1);
    }
  });

  // Keep process alive
  // Don't let this script exit - it will cause the container to restart
  process.on('SIGTERM', () => {
    console.log('🛑 [DEPLOY] Received SIGTERM, shutting down gracefully...');
    nextProcess.kill('SIGTERM');
    setTimeout(() => {
      process.exit(0);
    }, 5000);
  });

  process.on('SIGINT', () => {
    console.log('🛑 [DEPLOY] Received SIGINT, shutting down gracefully...');
    nextProcess.kill('SIGINT');
    setTimeout(() => {
      process.exit(0);
    }, 5000);
  });
}
