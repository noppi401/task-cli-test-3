const assert = require('assert');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { run } = require('../lib/cli');

async function captureRun(args) {
  const logs = [];
  const errors = [];
  const originalLog = console.log;
  const originalError = console.error;

  console.log = message => logs.push(String(message));
  console.error = message => errors.push(String(message));

  try {
    const exitCode = await run(['node', 'index.js', ...args]);
    return { exitCode, stdout: logs.join('\\n'), stderr: errors.join('\\n') };
  } finally {
    console.log = originalLog;
    console.error = originalError;
  }
}

function makeTempFile() {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'task-cli-test-'));
  return path.join(dir, 'tasks.json');
}

async function main() {
  for (const args of [['--help'], ['help'], []]) {
    const result = await captureRun(args);
    assert.strictEqual(result.exitCode, 0);
    assert.match(result.stdout, /Usage:/);
    assert.match(result.stdout, /task-cli \[--file <path>\] <command> \\options\]/);
    assert.match(result.stdout, /add <title>/);
    assert.match(result.stdout, /list \[--filter <status>\]/);
  }

  const file = makeTempFile();

  let result = await captureRun(['--file', file, 'add', 'Buy groceries']);
  assert.strictEqual(result.exitCode, 0);
  assert.strictEqual(result.stdout, 'Task added (ID: 1)');

  result = await captureRun(['add', 'Write report', `--file=${file}`]);
  assert.strictEqual(result.exitCode, 0);
  assert.strictEqual(result.stdout, 'Task added (ID: 2)');

  result = await captureRun(['--file', file, 'list']);
  assert.strictEqual(result.exitCode, 0);
  assert.match(result.stdout, /Buy groceries/);
  assert.match(result.stdout, /Write report/);

  result = await captureRun(['--file', file, 'complete', '2']);
  assert.strictEqual(result.exitCode, 0);
  assert.strictEqual(result.stdout, 'Task 2 marked as complete');

  result = await captureRun(['--file', file, 'list', '--filter', 'pending']);
  assert.strictEqual(result.exitCode, 0);
  assert.match(result.stdout, /Buy groceries/);
  assert.doesNotMatch(result.stdout, /Write report/);

  result = await captureRun(['--file', file, 'list', '--filter', 'completed']);
  assert.strictEqual(result.exitCode, 0);
  assert.match(result.stdout, /Write report/);
  assert.doesNotMatch(result.stdout, /Buy groceries/);

  result = await captureRun(['--file', file, 'delete', '1']);
  assert.strictEqual(result.exitCode, 0);
  assert.strictEqual(result.stdout, 'Task 1 deleted');

  result = await captureRun(['--file']);
  assert.strictEqual(result.exitCode, 1);
  assert.match(result.stderr, /Option --file requires a path/);

  result = await captureRun(['add']);
  assert.strictEqual(result.exitCode, 1);
  assert.match(result.stderr, /Task title is required/);

  result = await captureRun(['list', '--filter', 'archived']);
  assert.strictEqual(result.exitCode, 1);
  assert.match(result.stderr, /Filter must be one of: all, pending, completed/);

  result = await captureRun(['complete', 'abc']);
  assert.strictEqual(result.exitCode, 1);
  assert.match(result.stderr, /Task ID must be a positive integer/);

  console.log('cli tests passed');
}

main().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
