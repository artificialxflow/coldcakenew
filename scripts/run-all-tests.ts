import { spawnSync } from 'node:child_process';
import { appendFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';

type Phase = {
  id: string;
  name: string;
  script: string;
};

const phases: Phase[] = [
  { id: '2', name: 'Product & Inventory', script: 'scripts/test-phase-2.ts' },
  { id: '3', name: 'Sales & Orders', script: 'scripts/test-phase-3.ts' },
  { id: '4', name: 'CRM & Messaging', script: 'scripts/test-phase-4.ts' },
  { id: '5', name: 'Special Features', script: 'scripts/test-phase-5.ts' },
  { id: '6', name: 'Admin & Reports', script: 'scripts/test-phase-6.ts' },
  { id: '7', name: 'E2E & Final', script: 'scripts/test-phase-7.ts' },
];

const resultsFile = resolve('test_planning/TEST_RESULTS.jsonl');

function writeResult(data: Record<string, unknown>) {
  appendFileSync(resultsFile, `${JSON.stringify(data)}\n`);
}

function runPhase(phase: Phase) {
  const scriptPath = resolve(phase.script);
  const startedAt = new Date().toISOString();
  const isWin = process.platform === 'win32';
  const npxCmd = isWin ? 'cmd.exe' : 'npx';

  if (!existsSync(scriptPath)) {
    writeResult({
      phaseId: phase.id,
      phaseName: phase.name,
      status: 'skipped',
      reason: 'script_not_found',
      script: phase.script,
      startedAt,
      finishedAt: new Date().toISOString(),
    });
    console.warn(`⚠️  Phase ${phase.id} skipped (script missing): ${phase.script}`);
    return true;
  }

  console.log(`\n▶ Running Phase ${phase.id}: ${phase.name}`);
  const args = isWin
    ? ['/d', '/s', '/c', `npx --yes tsx ${phase.script}`]
    : ['--yes', 'tsx', phase.script];
  const result = spawnSync(npxCmd, args, {
    env: process.env,
    encoding: 'utf8',
  });
  if (result.stdout) process.stdout.write(result.stdout);
  if (result.stderr) process.stderr.write(result.stderr);

  const finishedAt = new Date().toISOString();
  const status = result.status === 0 ? 'passed' : 'failed';

  writeResult({
    phaseId: phase.id,
    phaseName: phase.name,
    status,
    exitCode: result.status,
    script: phase.script,
    startedAt,
    finishedAt,
  });

  if (status === 'failed') {
    console.error(`❌ Phase ${phase.id} failed. Stopping further tests.`);
    return false;
  }

  console.log(`✅ Phase ${phase.id} completed.`);
  return true;
}

console.log('🧪 Starting full automated test run...');
console.log(`📝 Results will be saved to: ${resultsFile}`);

for (const phase of phases) {
  const ok = runPhase(phase);
  if (!ok) break;
}

console.log('🏁 Test run finished.');
