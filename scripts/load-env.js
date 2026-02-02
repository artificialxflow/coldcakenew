#!/usr/bin/env node

/**
 * Load .env and .env.local into process.env (for Node scripts that run before Next.js).
 * Next.js loads these automatically when running next build; this is for prebuild/build scripts.
 */
const fs = require('fs');
const path = require('path');

const projectRoot = path.join(__dirname, '..');

function parseEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return;
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq <= 0) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    process.env[key] = value;
  }
}

parseEnvFile(path.join(projectRoot, '.env'));
parseEnvFile(path.join(projectRoot, '.env.local'));
