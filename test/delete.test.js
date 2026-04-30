const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const test = require('node:test');

const { run } = require('../src/lib/cli');
const { deleteTask, readStore, writeStore } = require('../src/lib/tasks');

function tempTaskFile() {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'task-cli-'));
  return path.join(directory, 'tasks.json');
}

test('deleteTask removes an existing task and persists JSON', () => {
  const taskFile = tempTaskFile();
  writeStore({ tasks: [
    { id: 1, title: 'Keep me', status: 'pending', createdAt: '2024-01-01T00:00:00.000Z' },
    { id: 2, title: 'Remove me', status: 'pending', createdAt: '2024-01-02T00:00:00.000Z' },
  ] }, { taskFile });

  const deleted = deleteTask(2, { taskFile });
  const persisted = JSON.parse(fs.readFileSync(taskFile, 'utf8'));

  assert.equal(deleted.id, 2);
  assert.deepEqual(persisted.tasks.map(task => task.id), [1]);
});

test('deleteTask rejects an unknown ID without changing stored tasks', () => {
  const taskFile = tempTaskFile();
  const store = { tasks: [
    { id: 1, title: 'Keep me', status: 'pending', createdAt: '2024-01-01T00:00:00.000Z' },
  ] };
  writeStore(store, { taskFile });

  assert.throws(() => deleteTask(99, { taskFile }), /Task 99 not found/);
  assert.deepEqual(readStore({ taskFile }), store);
});

test('delete command validates invalid input', () => {
  const errors = [];
  const code = run(['delete', 'abc'], {
    taskFile: tempTaskFile(),
    output: () => {},
    error: (message) => errors.push(message),
  });

  assert.equal(code, 1);
  assert.match(errors[0], /Task ID must be a positive integer/);
});

test('delete command prints confirmation feedback', () => {
  const taskFile = tempTaskFile();
  const output = [];
  writeStore({ tasks: [
    { id: 1, title: 'Remove me', status: 'pending', createdAt: '2024-01-01T00:00:00.000Z' },
  ] }, { taskFile });

  const code = run(['delete', '1'], {
    taskFile,
    output: (message) => output.push(message),
    error: () => {},
  });

  assert.equal(code, 0);
  assert.deepEqual(output, ['Task 1 deleted']);
  assert.deepEqual(readStore({ taskFile }).tasks, []);
});
