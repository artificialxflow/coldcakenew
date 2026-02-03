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

if (!fs.existsSync(standalonePath)) {
  console.error('Standalone server not found at:', standalonePath);
  process.exit(1);
}

const child = spawn('node', [standalonePath], {
  cwd: projectRoot,
  env: { ...process.env, PORT: port, HOSTNAME: hostname || '0.0.0.0' },
  stdio: 'inherit',
});

child.on('error', (err) => {
  console.error('Spawn error:', err);
  process.exit(1);
});

child.on('exit', (code, signal) => {
  process.exit(code ?? 1);
});
