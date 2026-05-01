const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const test = require('node:test');

const tasks = require('../lib/tasks');

async function withTempFile(fn) {
  const dir = await fs.promises.mkdtemp(path.join(os.tmpdir(), 'task-cli-'));
  const filePath = path.join(dir, 'tasks.json');

  try {
    await fn(filePath);
  } finally {
    await fs.promises.rm(dir, { recursive: true, force: true });
  }
}

test('deleteTask removes an existing task and persists the change', async () => {
  await withTempFile(async (filePath) => {
    await fs.promises.writeFile(
      filePath,
      JSON.stringify({ tasks: [
        { id: 1, title: 'keep', status: 'pending', createdAt: '2024-01-01T00:00:00.000Z' },
        { id: 2, title: 'delete', status: 'pending', createdAt: '2024-01-02T00:00:00.000Z' }
      ] }),
      'utf8'
    );

    const deleted = await tasks.deleteTask(2, { filePath });
    const saved = JSON.parse(await fs.promises.readFile(filePath, 'utf8'));

    assert.equal(deleted.id, 2);
    assert.deepEqual(saved.tasks.map((task) => task.id), [1]);
  });
});

test('deleteTask rejects invalid IDs', async () => {
  await withTempFile(async (filePath) => {
    await assert.rejects(
      () => tasks.deleteTask('abc', { filePath }),
      /Task ID must be a positive integer/
    );
  });
});

test('deleteTask reports missing tasks', async () => {
  await withTempFile(async (filePath) => {
    await fs.promises.writeFile(filePath, JSON.stringify-j�,���k���,z�kz7��