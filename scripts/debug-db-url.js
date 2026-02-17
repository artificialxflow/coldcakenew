/**
 * One-off debug script: logs safe DATABASE_URL parts (no password) to debug endpoint.
 * Run: node scripts/debug-db-url.js
 * Requires .env in project root (same as Prisma).
 */
const fs = require('fs');
const path = require('path');

const endpoint = 'http://127.0.0.1:7250/ingest/3d31f3d8-274e-4275-a595-383f8a58a75d';
function log(data) {
  fetch(endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...data, timestamp: Date.now() }) }).catch(() => {});
}

// Load .env from project root (same as Prisma)
const envPath = path.resolve(__dirname, '..', '.env');
const fileExists = fs.existsSync(envPath);
log({ location: 'debug-db-url.js:env', message: 'env check', data: { envPath, fileExists }, hypothesisId: 'H4' });

if (fileExists) {
  const content = fs.readFileSync(envPath, 'utf8');
  const lines = content.split(/\r?\n/);
  log({ location: 'debug-db-url.js:read', message: 'env read', data: { contentLength: content.length, lineCount: lines.length }, hypothesisId: 'H4' });

  lines.forEach((line) => {
    const trimmed = line.replace(/\r$/, '').trim();
    if (!trimmed || trimmed.startsWith('#')) return;
    const eq = trimmed.indexOf('=');
    if (eq === -1) return;
    const key = trimmed.slice(0, eq).trim();
    let val = trimmed.slice(eq + 1).trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) val = val.slice(1, -1);
    process.env[key] = val;
    if (key === 'DATABASE_URL') log({ location: 'debug-db-url.js:set', message: 'DATABASE_URL set', data: { valueLength: val.length }, hypothesisId: 'H4' });
  });
}

const url = process.env.DATABASE_URL;
if (!url) {
  log({ location: 'debug-db-url.js:exit', message: 'DATABASE_URL not set', data: { hasUrl: false }, hypothesisId: 'H4' });
  console.error('DATABASE_URL not set');
  process.exit(1);
}

let parsed;
try {
  parsed = new URL(url);
} catch (e) {
  console.error('DATABASE_URL parse error:', e.message);
  process.exit(1);
}

const host = parsed.hostname;
const port = parsed.port || '5432';
const db = (parsed.pathname || '').replace(/^\//, '') || 'postgres';
const user = parsed.username || '';
const passwordLength = parsed.password ? parsed.password.length : 0;
const hasSearchParams = (parsed.search || '').length > 0;
const searchParams = parsed.search || '';

const payload = {
  location: 'scripts/debug-db-url.js',
  message: 'DATABASE_URL safe parse',
  data: {
    host,
    port,
    database: db,
    user,
    passwordLength,
    hasSearchParams,
    searchParams: searchParams || undefined,
    urlScheme: parsed.protocol,
  },
  timestamp: Date.now(),
  hypothesisId: 'H4',
};

fetch(endpoint, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(payload),
}).catch(() => {});

console.log('Safe DATABASE_URL info:', JSON.stringify(payload.data, null, 2));
