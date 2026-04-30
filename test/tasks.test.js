import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { after, describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { createTaskManager } from '../lib/tasks.js';

const tmpDirs = [];

function makeTempStore() {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'task-cli-'));
  tmpDirs.push(dir);
  return path.join(dir, 'tasks.json');
}

after(() => {
  tmpDirs.forEach((dir) => fs.rmSync(dir, { recursive: true, force: true }));
});

describe('TaskManager.addTask', () => {
  it('creates a persisted pending task with a unique id, trimmed title, and ISO timestamp', () => {
    const filePath = makeTempStore();
    const manager = createTaskManager(filePath);

    const first = manager.addTask('  Buy groceries  ');
    const second = manager.addTask('Pay bills');

    assert.equal(first.id, 1);
    assert.equal(second.id, 2);
    assert.equal(first.title, 'Buy groceries');
    assert.equal(first.status, 'pending');
    assert.doesNotThrow(() => new Date(first.createdAt).toISOString());

    const persisted = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    assert.deepEqual(persisted.tasks, [first, second]);
  });
});
