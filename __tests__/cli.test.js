import { CLI } from '../lib/cli.js';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

describe('CLI Command Handling and Validation', () => {
  let cli;
  let tempDir;

  beforeEach(async () => {
    tempDir = await mkdtemp(join(tmpdir(), 'task-test-'));
    cli = new CLI(join(tempDir, 'tasks.json'));
    await cli.taskManager.initialize();
  });

  afterEach(async () => {
    await rm(tempDir, { recursive: true });
  });

  describe('add command', () => {
    it('should require a task title', async () => {
      const result = await cli.handleAdd([]);
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('should reject empty task title', async () => {
      const result = await cli.handleAdd(['']);
      expect(result.success).toBe(false);
      expect(result.error).toContain('empty');
    });

    it('should add valid task successfully', async () => {
      const result = await cli.handleAdd(['Buy groceries']);
      expect(result.success).toBe(true);
      expect(result.id).toBeDefined();
      expect(result.message).toContain('Task added');
    });

    it('should enforce maximum title length', async () => {
      const longTitle = 'x'.repeat(501);
      const result = await cli.handleAdd([longTitle]);
      expect(result.success).toBe(false);
      expect(result.error).toContain('too long');
    });
  });

  describe('list command', () => {
    beforeEach(async () => {
      await cli.handleAdd(['Task 1']);
      await cli.handleAdd(['Task 2']);
    });

    it('should list all tasks when no filter provided', async () => {
      const result = await cli.handleList([]);
      expect(result.success).toBe(true);
      expect(result.tasks.length).toBe(2);
    });

    it('should filter pending tasks', async () => {
      const result = await cli.handleList(['--filter', 'pending']);
      expect(result.success).toBe(true);
      expect(result.tasks.every(t => t.status === 'pending')).toBe(true);
    });

    it('should filter completed tasks', async () => {
      await cli.handleComplete(['1']);
      const result = await cli.handleList(['--filter', 'completed']);
      expect(result.success).toBe(true);
      expect(result.tasks.every(t => t.status === 'completed')).toBe(true);
    });

    it('should reject invalid filter option', async () => {
      const result = await cli.handleList(['--filter', 'invalid']);
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  describe('complete command', () => {
    beforeEach(async () => {
      await cli.handleAdd(['Test task']);
    });

    it('should require task ID', async () => {
      const result = await cli.handleComplete([]);
      expect(result.success).toBe(false);
      expect(result.error).toContain('ID');
    });

    it('should reject non-numeric ID', async () => {
      const result = await cli.handleComplete(['abc']);
      expect(result.success).toBe(false);
      expect(result.error).toContain('ID');
    });

    it('should reject negative ID', async () => {
      const result = await cli.handleComplete(['-1']);
      expect(result.success).toBe(false);
    });

    it('should reject non-existent task ID', async () => {
      const result = await cli.handleComplete(['999']);
      expect(result.success).toBe(false);
      expect(result.error).toContain('not found');
    });

    it('should mark existing task as complete', async () => {
      const result = await cli.handleComplete(['1']);
      expect(result.success).toBe(true);
      expect(result.message).toContain('completed');
    });

    it('should prevent double completion', async () => {
      await cli.handleComplete(['1']);
      const result = await cli.handleComplete(['1']);
      expect(result.success).toBe(false);
      expect(result.error).toContain('already');
    });
  });

  describe('delete command', () => {
    beforeEach(async () => {
      await cli.handleAdd(['Task to delete']);
    });

    it('should require task ID', async () => {
      const result = await cli.handleDelete([]);
      expect(result.success).toBe(false);
      expect(result.error).toContain('ID');
    });

    it('should reject non-numeric ID', async () => {
      const result = await cli.handleDelete(['abc']);
      expect(result.success).toBe(false);
    });

    it('should reject non-existent task ID', async () => {
      const result = await cli.handleDelete(['999']);
      expect(result.success).toBe(false);
      expect(result.error).toContain('not found');
    });

    it('should delete existing task', async () => {
      const result = await cli.handleDelete(['1']);
      expect(result.success).toBe(true);
      expect(result.message).toContain('deleted');
    });

    it('should not list deleted task', async () => {
      await cli.handleDelete(['1']);
      const result = await cli.handleList([]);
      expect(result.tasks.length).toBe(0);
    });
  });
});