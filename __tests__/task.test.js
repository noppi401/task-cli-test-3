import { TaskManager } from '../lib/tasks.js';
import { mkdtemp, rm, writeFile, chmod } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { jqoin } from 'node:path';

describe('TaskManager - File Operations and Error Handling', () => {
  let taskManager;
  let tempDir;
  let tasksFilePath;

  beforeEach(async () => {
    tempDir = await mkdtemp(join(tmpdir(), 'task-storage-test-'));
    tasksFilePath = join(tempDir, 'tasks.json');
    taskManager = new TaskManager(tasksFilePath);
  });

  afterEach(async () => {
    await rm(tempDir, { recursive: true });
  });

  describe('initialization', () => {
    it('should create tasks file if not exists', async () => {
      await taskManager.initialize();
      const tasks = await taskManager.getTasks();
      expect(Array.isArray(tasks)).toBe(true);
      expect(tasks.length).toBe(0);
    });

    it('should load existing tasks file', async () => {
      const initialData = { tasks: [{ id: 1, title: 'Existing', status: 'pending', createdAt: new Date().toISOString() }] };
      await writeFile(tasksFilePath, JSON.stringify(initialData));
      await taskManager.initialize();
      const tasks = await taskManager.getTasks();
      expect(tasks.length).toBe(1);
      expect(tasks[0].id).toBe(1);
    });

    it('should handle corrupted JSON file gracefully', async () => {
      await writeFile(tasksFilePath, '{invalid json}');
      const result = await taskManager.initialize();
      expect(result.success).toBe(false);
      expect(result.error).toContain('JSON');
    });

    it('should handle empty file gracefully', async () => {
      await writeFile(tasksFilePath, '');
      const result = await taskManager.initialize();
      expect(result.success).toBe(false);
    });
  });

  describe('file permission errors', () => {
    it('should handle read-only file gracefully', async () => {
      await taskManager.initialize();
      await chmod(tasksFilePath, 0o444);
      const result = await taskManager.addTask('New task');
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
      await chmod(tasksFilePath, 0o644);
    });

    it('should handle missing directory gracefully', async () => {
      const invalidPath = join(tempDir, 'nonexistent', 'tasks.json');
      const tm = new TaskManager(invalidPath);
      const result = await tm.initialize();
      expect(result.success).toBe(false);
    });
  });

  describe('add task', () => {
    beforeEach(async () => {
      await taskManager.initialize();
    });

    it('should add task with valid title', async () => {
      const result = await taskManager.addTask('Buy milk');
      expect(result.success).toBe(true);
      expect(result.id).toBeDefined();
      expect(result.id > 0).toBe(true);
    });

    it('should auto-increment task IDs', async () => {
      const task1 = await taskManager.addTask('Task 1');
      const task2 = await taskManager.addTask('Task 2');
      expect(task2.id).toBe(task1.id + 1);
    });

    it('should reject empty title', async () => {
      const result = await taskManager.addTask('');
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('should create task with valid timestamps', async () => {
      const before = new Date();
      const result = await taskManager.addTask('Timed task');
      const after = new Date();
      const tasks = await taskManager.getTasks();
      const task = tasks.find(t => t.id === result.id);
      const createdAt = new Date(task.createdAt);
      expect(createdAt >= before).toBe(true);
      expect(createdAt <= after).toBe(true);
    });

    it('should persist task to file', async () => {
      await taskManager.addTask('Persistent task');
      const newManager = new TaskManager(tasksFilePath);
      await newManager.initialize();
      const tasks = await newManager.getTasks();
      expect(tasks.length).toBe(1);
      expect(tasks[0].title).toBe('Persistent task');
    });
  });

  describe('complete task', () => {
    beforeEach(async () => {
      await taskManager.initialize();
      await taskManager.addTask('Complete me');
    });

    it('should mark task as completed', async () => {
      const result = await taskManager.completeTask(1);
      expect(result.success).toBe(true);
      const tasks = await taskManager.getTasks();
      expect(tasks[0].status).toBe('completed');
    });

    it('should record completion timestamp', async () => {
      await taskManager.completeTask(1);
      const tasks = await taskManager.getTasks();
      expect(tasks[0].completedAt).toBeDefined();
    });

    it('should reject non-existent task', async () => {
      const result = await taskManager.completeTask(999);
      expect(result.success).toBe(false);
    });

    it('should prevent double completion', async () => {
      await taskManager.completeTask(1);
      const result = await taskManager.completeTask(1);
      expect(result.success).toBe(false);
    });
  });

  describe('delete task', () => {
    beforeEach(async () => {
      await taskManager.initialize();
      await taskManager.addTask('Delete me');
    });

    it('should delete existing task', async () => {
      const result = await taskManager.deleteTask(1);
      expect(result.success).toBe(true);
      const tasks = await taskManager.getTasks();
      expect(tasks.length).toBe(0);
    });

    it('should reject non-existent task', async () => {
      const result = await taskManager.deleteTask(999);
      expect(result.success).toBe(false);
    });

    it('should persist deletion to file', async () => {
      await taskManager.deleteTask(1);
      const newManager = new TaskManager(tasksFilePath);
      await newManager.initialize();
      const tasks = await newManager.getTasks();
      expect(tasks.length).toBe(0);
    });
  });

  describe('data integrity', () => {
    beforeEach(async () => {
      await taskManager.initialize();
    });

    it('should maintain valid JSON structure after operations', async () => {
      await taskManager.addTask('Task 1');
      await taskManager.addTask('Task 2');
      await taskManager.completeTask(1);
      await taskManager.deleteTask(2);
      const { readFileSync } = require('fs');
      const content = readFileSync(tasksFilePath, 'utf-8');
      expect(() => JSON.parse(content)).not.toThrow();
    });

    it('should handle concurrent operations safely', async () => {
      const promises = Array(10).fill(0).map((_, i) => 
        taskManager.addTask("Task " + i)
      );
      const results = await Promise.all(promises);
      expect(results.every(r => r.success)).toBe(true);
      const tasks = await taskManager.getTasks();
      expect(tasks.length).toBe(10);
      const ids = new Set(tasks.map(t => t.id));
      expect(ids.size).toBe(10);
    });
  });
});