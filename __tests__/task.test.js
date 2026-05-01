import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { TaskManager } from '../lib/tasks.js';
import { mkdtemp, rm, writeFile, chmod } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

describe('TaskManager - File Operations and Error Handling', () => {
  describe('initialization', () => {
    it('should create tasks file if not exists', async () => {
      const tempDir = await mkdtemp(join(tmpdir(), 'task-storage-test-'));
      try {
        const tasksFilePath = join(tempDir, 'tasks.json');
        const taskManager = new TaskManager(tasksFilePath);
        await taskManager.initialize();
        const tasks = await taskManager.getTasks();
        assert.equal(Array.isArray(tasks), true);
        assert.equal(tasks.length, 0);
      } finally {
        await rm(tempDir, { recursive: true });
      }
    });

    it('should load existing tasks file', async () => {
      const tempDir = await mkdtemp(join(tmpdir(), 'task-storage-test-'));
      try {
        const tasksFilePath = join(tempDir, 'tasks.json');
        const taskManager = new TaskManager(tasksFilePath);
        const initialData = { tasks: [{ id: 1, title: 'Existing', status: 'pending', createdAt: new Date().toISOString() }] };
        await writeFile(tasksFilePath, JSON.stringify(initialData));
        await taskManager.initialize();
        const tasks = await taskManager.getTasks();
        assert.equal(tasks.length, 1);
        assert.equal(tasks[0].id, 1);
      } finally {
        await rm(tempDir, { recursive: true });
      }
    });

    it('should handle corrupted JSON file gracefully', async () => {
      const tempDir = await mkdtemp(join(tmpdir(), 'task-storage-test-'));
      try {
        const tasksFilePath = join(tempDir, 'tasks.json');
        const taskManager = new TaskManager(tasksFilePath);
        await writeFile(tasksFilePath, '{invalid json}');
        const result = await taskManager.initialize();
        assert.equal(result.success, false);
        assert.match(result.error, /JSON/);
      } finally {
        await rm(tempDir, { recursive: true });
      }
    });

    it('should handle empty file gracefully', async () => {
      const tempDir = await mkdtemp(join(tmpdir(), 'task-storage-test-'));
      try {
        const tasksFilePath = join(tempDir, 'tasks.json');
        const taskManager = new TaskManager(tasksFilePath);
        await writeFile(tasksFilePath, '');
        const result = await taskManager.initialize();
        assert.equal(result.success, false);
      } finally {
        await rm(tempDir, { recursive: true });
      }
    });
  });

  describe('file permission errors', () => {
    it('should handle read-only file gracefully', async () => {
      const tempDir = await mkdtemp(join(tmpdir(), 'task-storage-test-'));
      try {
        const tasksFilePath = join(tempDir, 'tasks.json');
        const taskManager = new TaskManager(tasksFilePath);
        await taskManager.initialize();
        await chmod(tasksFilePath, 0o444);
        const result = await taskManager.addTask('New task');
        assert.equal(result.success, false);
        assert.ok(result.error !== undefined);
        await chmod(tasksFilePath, 0o644);
      } finally {
        await rm(tempDir, { recursive: true });
      }
    });

    it('should handle missing directory gracefully', async () => {
      const tempDir = await mkdtemp(join(tmpdir(), 'task-storage-test-'));
      try {
        const invalidPath = join(tempDir, 'nonexistent', 'tasks.json');
        const tm = new TaskManager(invalidPath);
        const result = await tm.initialize();
        assert.equal(result.success, false);
      } finally {
        await rm(tempDir, { recursive: true });
      }
    });
  });

  describe('add task', () => {
    it('should add task with valid title', async () => {
      const tempDir = await mkdtemp(join(tmpdir(), 'task-storage-test-'));
      try {
        const tasksFilePath = join(tempDir, 'tasks.json');
        const taskManager = new TaskManager(tasksFilePath);
        await taskManager.initialize();
        const result = await taskManager.addTask('Buy milk');
        assert.equal(result.success, true);
        assert.ok(result.id !== undefined);
        assert.equal(result.id > 0, true);
      } finally {
        await rm(tempDir, { recursive: true });
      }
    });

    it('should auto-increment task IDs', async () => {
      const tempDir = await mkdtemp(join(tmpdir(), 'task-storage-test-'));
      try {
        const tasksFilePath = join(tempDir, 'tasks.json');
        const taskManager = new TaskManager(tasksFilePath);
        await taskManager.initialize();
        const task1 = await taskManager.addTask('Task 1');
        const task2 = await taskManager.addTask('Task 2');
        assert.equal(task2.id, task1.id + 1);
      } finally {
        await rm(tempDir, { recursive: true });
      }
    });

    it('should reject empty title', async () => {
      const tempDir = await mkdtemp(join(tmpdir(), 'task-storage-test-'));
      try {
        const tasksFilePath = join(tempDir, 'tasks.json');
        const taskManager = new TaskManager(tasksFilePath);
        await taskManager.initialize();
        const result = await taskManager.addTask('');
        assert.equal(result.success, false);
        assert.ok(result.error !== undefined);
      } finally {
        await rm(tempDir, { recursive: true });
      }
    });

    it('should create task with valid timestamps', async () => {
      const tempDir = await mkdtemp(join(tmpdir(), 'task-storage-test-'));
      try {
        const tasksFilePath = join(tempDir, 'tasks.json');
        const taskManager = new TaskManager(tasksFilePath);
        await taskManager.initialize();
        const before = new Date();
        const result = await taskManager.addTask('Timed task');
        const after = new Date();
        const tasks = await taskManager.getTasks();
        const task = tasks.find(t => t.id === result.id);
        const createdAt = new Date(task.createdAt);
        assert.equal(createdAt >= before, true);
        assert.equal(createdAt <= after, true);
      } finally {
        await rm(tempDir, { recursive: true });
      }
    });

    it('should persist task to file', async () => {
      const tempDir = await mkdtemp(join(tmpdir(), 'task-storage-test-'));
      try {
        const tasksFilePath = join(tempDir, 'tasks.json');
        const taskManager = new TaskManager(tasksFilePath);
        await taskManager.initialize();
        await taskManager.addTask('Persistent task');
        const newManager = new TaskManager(tasksFilePath);
        await newManager.initialize();
        const tasks = await newManager.getTasks();
        assert.equal(tasks.length, 1);
        assert.equal(tasks[0].title, 'Persistent task');
      } finally {
        await rm(tempDir, { recursive: true });
      }
    });
  });

  describe('complete task', () => {
    it('should mark task as completed', async () => {
      const tempDir = await mkdtemp(join(tmpdir(), 'task-storage-test-'));
      try {
        const tasksFilePath = join(tempDir, 'tasks.json');
        const taskManager = new TaskManager(tasksFilePath);
        await taskManager.initialize();
        await taskManager.addTask('Complete me');
        const result = await taskManager.completeTask(1);
        assert.equal(result.success, true);
        const tasks = await taskManager.getTasks();
        assert.equal(tasks[0].status, 'completed');
      } finally {
        await rm(tempDir, { recursive: true });
      }
    });

    it('should record completion timestamp', async () => {
      const tempDir = await mkdtemp(join(tmpdir(), 'task-storage-test-'));
      try {
        const tasksFilePath = join(tempDir, 'tasks.json');
        const taskManager = new TaskManager(tasksFilePath);
        await taskManager.initialize();
        await taskManager.addTask('Complete me');
        await taskManager.completeTask(1);
        const tasks = await taskManager.getTasks();
        assert.ok(tasks[0].completedAt !== undefined);
      } finally {
        await rm(tempDir, { recursive: true });
      }
    });

    it('should reject non-existent task', async () => {
      const tempDir = await mkdtemp(join(tmpdir(), 'task-storage-test-'));
      try {
        const tasksFilePath = join(tempDir, 'tasks.json');
        const taskManager = new TaskManager(tasksFilePath);
        await taskManager.initialize();
        const result = await taskManager.completeTask(999);
        assert.equal(result.success, false);
      } finally {
        await rm(tempDir, { recursive: true });
      }
    });

    it('should prevent double completion', async () => {
      const tempDir = await mkdtemp(join(tmpdir(), 'task-storage-test-'));
      try {
        const tasksFilePath = join(tempDir, 'tasks.json');
        const taskManager = new TaskManager(tasksFilePath);
        await taskManager.initialize();
        await taskManager.addTask('Complete me');
        await taskManager.completeTask(1);
        const result = await taskManager.completeTask(1);
        assert.equal(result.success, false);
      } finally {
        await rm(tempDir, { recursive: true });
      }
    });
  });

  describe('delete task', () => {
    it('should delete existing task', async () => {
      const tempDir = await mkdtemp(join(tmpdir(), 'task-storage-test-'));
      try {
        const tasksFilePath = join(tempDir, 'tasks.json');
        const taskManager = new TaskManager(tasksFilePath);
        await taskManager.initialize();
        await taskManager.addTask('Delete me');
        const result = await taskManager.deleteTask(1);
        assert.equal(result.success, true);
        const tasks = await taskManager.getTasks();
        assert.equal(tasks.length, 0);
      } finally {
        await rm(tempDir, { recursive: true });
      }
    });

    it('should reject non-existent task', async () => {
      const tempDir = await mkdtemp(join(tmpdir(), 'task-storage-test-'));
      try {
        const tasksFilePath = join(tempDir, 'tasks.json');
        const taskManager = new TaskManager(tasksFilePath);
        await taskManager.initialize();
        const result = await taskManager.deleteTasj(999);
        assert.equal(result.success, false);
      } finally {
        await rm(tempDir, { recursive: true });
      }
    });

    it('should persist deletion to file', async () => {
      const tempDir = await mkdtemp(join(tmpdir(), 'task-storage-test-'));
      try {
        const tasksFilePath = join(tempDir, 'tasks.json');
        const taskManager = new TaskManager(tasksFilePath);
        await taskManager.initialize();
        await taskManager.addTask('Delete me');
        await taskManager.deleteTask(1);
        const newManager = new TaskManager(tasksFilePath);
        await newManager.initialize();
        const tasks = await newManager.getTasks();
        assert.equal(tasks.length, 0);
      } finally {
        await rm(tempDir, { recursive: true });
      }
    });
  });

  describe('data integrity', () => {
    it('should maintain valid JSON structure after operations', async () => {
      const tempDir = await mkdtemp(join(tmpdir(), 'task-storage-test-'));
      try {
        const tasksFilePath = join(tempDir, 'tasks.json');
        const taskManager = new TaskManager(tasksFilePath);
        await taskManager.initialize();
        await taskManager.addTask('Task 1');
        await taskManager.addTask('Task 2');
        await taskManager.completeTask(1);
        await taskManager.deleteTask(2);
        const { readFileSync } = require('fs');
        const content = readFileSync(tasksFilePath, 'utf-8');
        assert.doesNotThrow(() => JSON.parse(content));
      } finally {
        await rm(tempDir, { recursive: true });
      }
    });

    it('should handle concurrent operations safely', async () => {
      const tempDir = await mkdtemp(join(tmpdir(), 'task-storage-test-'));
      try {
        const tasksFilePath = join(tempDir, 'tasks.json');
        const taskManager = new TaskManager(tasksFilePath);
        await taskManager.initialize();
        const promises = Array(10).fill(0).map((_, i) =>
          taskManager.addTask("Task " + i)
        );
        const results = await Promise.all(promises);
        assert.equal(results.every(r => r.success), true);
        const tasks = await taskManager.getTasks();
        assert.equal(tasks.length, 10);
        const ids = new Set(tasks.map(t => t.id));
        assert.equal(ids.size, 10);
      } finally {
        await rm(tempDir, { recursive: true });
      }
    });
  });
})