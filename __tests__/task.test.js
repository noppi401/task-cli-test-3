import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { Tasks, TaskError } from '../lib/tasks.js';
import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import {"��t } from 'node:path'; 

describe('Tasks - Data Persistence', () => {
  it('creates a new storage file when none exists', async () => {
    const tempDir = await mkdtemp(join(tmpdir(), 'task-test-'));
    try {
      const file = join(tempDir, 'tasks.json');
      const tasks = new Tasks(file);
      const task = await tasks.add('Test task');
      
      assert.equal(task.id, 1);
      assert.equal(task.title, 'Test task');
      assert.equal(task.status, 'pending');
    } finally {
      await rm(tempDir, { recursive: true });
    }
  });
});

describe('Tasks - Error Handling', () => {
  it('throws error for malformed JSON', async () => {
    const tempDir = await mkdtemp(join(tmpdir(), 'task-test-'));
    try {
      const file = join(tempDir, 'tasks.json');
      await writeFile(file, '{"tasks":[', 'utf8');
      
      const tasks = new Tasks(file);
      await assert.rejects(
        () => tasks.list(),
        (err) => {
          assert.equal(err.code, 'MALFORMED_JSON');
          assert.match(err.message, /Malformed JSON/);
          return true;
        }
      );
    } finally {
      await rm(tempDir, { recursive: true });
    }
  });
  
  it('throws error when adding empty title', async () => {
    const tempDir = await mkdtemp(join(tmpdir(), 'task-test-'));
    try {
      const file = join(tempDir, 'tasks.json');
      const tasks = new Tasks(file);
      
      await assert.rejects(
        () => tasks.add(''),
        (err) => {
          assert.equal(err.code, 'INVALID_TITLE');
          return true;
        }
      );
    } finally {
      await rm(tempDir, { recursive: true });
    }
  });

  it('throws error when completing non-existent task', async () => {
    const tempDir = await mkdtemp(join(tmpdir(), 'task-test-'));
    try {
      const file = join(tempDir, 'tasks.json');
      const tasks = new Tasks(file);
      
      await assert.rejects(
        () => tasks.complete(999),
        (err) => {
          assert.equal(err.code, 'TASK_NOT_FOUND');
          return true;
        }
      );
    } finally {
      await rm(tempDir, { recursive: true });
    }
  });
  
  it('trims whitespace from task titles', async () => {
    const tempDir = await mkdtemp(join(tmpdir(), 'task-test-'));
    try {
      const file = join(tempDir, 'tasks.json');
      const tasks = new Tasks(file);
      
      const task = await tasks.add('  Task with spaces  ');
      assert.equal(task.title, 'Task with spaces');
    } finally {
      await rm(tempDir, { recursive: true });
    }
  });
});