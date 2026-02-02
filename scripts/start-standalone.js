#!/usr/bin/env node
/**
 * Start standalone server with instrumentation for debug (H2, H4).
 * Run from project root: node scripts/start-standalone.js
 */
const path = require('path');
const fs = require('fs');
const { spawn } = require('child_process');

const projectRoot = path.join(__dirname, '..');
const standalonePath = path.join(projectRoot, '.next', 'standalone', 'server.js');
const cwd = process.cwd();
const port = process.env.PORT || '3000';
const hostname = process.env.HOSTNAME || process.env.HOST || '';

// #region agent log
fetch('http://127.0.0.1:7248/ingest/5c26e490-151e-4b3c-9e76-6a9569d3ce00',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'scripts/start-standalone.js:entry',message:'About to start standalone',data:{cwd,projectRoot,port,hostname,standaloneExists:fs.existsSync(standalonePath),standalonePath},timestamp:Date.now(),sessionId:'debug-session',runId:'start',hypothesisId:'H2'})}).catch(()=>{});
// #endregion

if (!fs.existsSync(standalonePath)) {
  // #region agent log
  fetch('http://127.0.0.1:7248/ingest/5c26e490-151e-4b3c-9e76-6a9569d3ce00',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'scripts/start-standalone.js:missing',message:'Standalone server.js not found',data:{standalonePath},timestamp:Date.now(),sessionId:'debug-session',runId:'start',hypothesisId:'H2'})}).catch(()=>{});
  // #endregion
  console.error('Standalone server not found at:', standalonePath);
  process.exit(1);
}

const child = spawn('node', [standalonePath], {
  cwd: projectRoot,
  env: { ...process.env, PORT: port, HOSTNAME: hostname || '0.0.0.0' },
  stdio: 'inherit',
});

// #region agent log
fetch('http://127.0.0.1:7248/ingest/5c26e490-151e-4b3c-9e76-6a9569d3ce00',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'scripts/start-standalone.js:spawned',message:'Standalone process spawned',data:{pid:child.pid,envPort:port,envHostname:hostname||'0.0.0.0'},timestamp:Date.now(),sessionId:'debug-session',runId:'start',hypothesisId:'H4'})}).catch(()=>{});
// #endregion

child.on('error', (err) => {
  // #region agent log
  fetch('http://127.0.0.1:7248/ingest/5c26e490-151e-4b3c-9e76-6a9569d3ce00',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'scripts/start-standalone.js:error',message:'Standalone spawn error',data:{error:err.message,code:err.code},timestamp:Date.now(),sessionId:'debug-session',runId:'start',hypothesisId:'H2'})}).catch(()=>{});
  // #endregion
  console.error('Spawn error:', err);
  process.exit(1);
});

child.on('exit', (code, signal) => {
  // #region agent log
  fetch('http://127.0.0.1:7248/ingest/5c26e490-151e-4b3c-9e76-6a9569d3ce00',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'scripts/start-standalone.js:exit',message:'Standalone process exited',data:{code,signal},timestamp:Date.now(),sessionId:'debug-session',runId:'start',hypothesisId:'H2'})}).catch(()=>{});
  // #endregion
  process.exit(code ?? 1);
});
