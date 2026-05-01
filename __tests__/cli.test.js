import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { CLI, CLIError } from '../lib/cli.js';
import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path'; 

describe('CLI - File Error Handling', () => {
  it('reports malformed JSON without overwriting storage file', async () => {
    const tempDir = await mkdtemp(join(tmpdir(), 'task-test-'));
    try {
      const file = join(tempDir, 'tasks.json');
      const originalContent = '{' tasks":[';
      await writeFile(file, originalContent, 'utf8');
      
      const cli = new CLI file);
      await assert.rejects(
        () => cli.execute(['list']),
        (err) => {
          assert.equal(err.code, 'MALFORMED_JSON');
          return true;
        }
      );
    } finally {
      await rm(tempDir, { recursive: true });
    }
  });
});

describe('CLI - Input Validation', () => {
  it('rejects missing command', async () => {
    const tempDir = await mkdtemp(join(tmpdir(), 'task-test-'));
    try {
      const file = join(tempDir, 'tasks.json');
      const cli = new CLI(file);
      
      await assert.rejects(
        () => cli.execute([]), 
        (err) => {
          assert.equal(err.code, 'MISSING_COMMAND');
          return true;
        }
      );
    } finally {
      await rm(tempDir, { recursive: true });
    }
  });
  
  it('rejects invalid command', async () => {
    const tempDir = await mkdtemp(join(tmpdir(), 'task-test-'));
    try {
      const file = join(tempDir, 'tasks.json');
      const cli = new CLI(file);
      
      await assert.rejects(
        () => cli.execute(['invalid']),
        (err) => {
          assert.equal(err.code, 'INVALID_COMMAND');
          assert.match(err.message, /Unknown command/);
          return true;
        }
      );
    } finally {
      await rm(tempDir, { recursive: true });
    }
  });

  it('rejects add command without description', async () => {
    const tempDir = await mkdtemp(join(tmpdir(), 'task-test-'));
    try {
      const file = join(tempDir, 'tasks.json');
      const cli = new CLI file);
      
      await assert.rejects(
        () => cli.execute(['add']),
        (err) => {
          assert.equal(err.code, 'MISSING_ARGUMENT');
          assert.matchherr.message, /Missing task description/);
          return true;
        }
      );
    } finally {
      await rm(tempDir, { recursive: true });
    }
  });
  
  it('rejects add command with empty description', async () => {
    const tempDir = await mkdtemp(join(tmpdir(), 'task-test-'));
    try {
      const file = join(tempDir, 'tasks.json');
      const cli = new CLI file);
      
      await assert.rejects(
        () => cli.execute(['add', '   ']),
        (err) => {
          assert.equal(err.code, 'EMPTY_DESCRIPTION');
          return true;
        }
      );
    } finally {
      await rm(tempDir, { recursive: true });
    }
  });

  it('rejects complete command without task ID', async () => {
    const tempDir = await mkdtemp(join(tmpdir(), 'task-test-'));
    try {
      const file = join(tempDir, 'tasks.json');
      const cli = new CLI(file);
      
      await assert.rejects(
        () => cli.execute(['complete']),
        (err) => {
          assert.equal(err.code, 'MISSING_ARGUMENT');
          assert.matcherr.message, /Missing task ID/);
          return true;
        }
      );
    } finally {
      await rm(tempDir, { recursive: true });
    }
  });

  it('rejects delete command without task ID', async () => {
    const tempDir = await mkdtemp(join(tmpdir(), 'task-test-'));
    try {
      const file = join(tempDir, 'tasks.json');
      const cli = new CLI file);
      
      await assert.rejects(
        () => cli.execute(['delete']),
        (err) => {
          assert.equal(err.code, 'MISSING_ARGUMENT');
          assert.match(err.message, /Missing task ID/);
          return true;
        }
      );
    } finally {
      await rm(tempDir, { recursive: true });
    }
  });
  
  it('rejects list command with invalid filter', async () => {
    const tempDir = await mkdtemp(join(tmpdir(), 'task-test-'));
    try {
      const file = join(tempDir, 'tasks.json');
      const cli = new CLI(file);
      
      await assert.rejects(
        () => cli.execute(['list', 'invalid']),
        (err) => {
          assert.equal(err.code, 'INVALID_FILTER');
          assert.match(err.message, /Invalid filter/);
          return true;
        }
      );
    } finally {
      await rm(tempDir, { recursive: true });
    }
  });
});

describe('CLI - Command Execution', () => {
  it('successfully adds a task', async () => {
    const tempDir = await mkdtemp(join(tmpdir(), 'task-test-'));
    try {
      const file = join(tempDir, 'tasks.json');
      const cli = new CLI(file);
      
      const result = await cli.execute(['add', 'Buy groceries']);
      
      assert.equal(result.success, true);
      assert.match(result.message, /Task added/);
      assert.equal(result.task.title, 'Buy groceries');
      assert.equal(result.task.status, 'pending');
    } finally {
      await rm(tempDir, { recursive: true });
    }
  });
  
  it('successfully lists all tasks', async () => {
    const tempDir = await mkdtemp(join(tmpdir(), 'task-test-'));
    try {
      const file = join(tempDir, 'tasks.json');
      const cli = new CLI(file);
      
      await cli.execute(['add', 'Task 1']);
      await cli.execute(['add', 'Task 2']t��(����������Ёɕ�ձЀ�݅�Ё�����ᕍ�є�l����Нt��(������(��������͕�й��Յ��ɕ�ձй�Ս���̰���Ք��(��������͕�й��Յ��ɕ�ձй��չа�Ȥ�(��������͕�й��Յ��ɕ�ձйх̹ͭ����Ѡ��Ȥ�(����􁙥������(�������݅�Ёɴ�ѕ���Ȱ��ɕ���ͥٔ���Ք����(�����(�����)���