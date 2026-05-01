import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { CLI } from '../lib/cli.js';
import { mkdtemp, rm, writeFile, mkdir, readFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

describe('CLI storage error handling', () => {
  it('reports malformed JSON without overwriting the storage file', async () => {
    const tempDir = await mkdtemp(join(tmpdir(), 'task-test-'));
    try {
      const file = join(tempDir, 'tasks.json');
      await writeFile(file, '{"tasks":[', 'utf8');
      const cli = new CLI(file);
      const result = await cli.taskManager.initialize();

      assert.equal(result.success, false);
      assert.match(result.error, /invalid json|malformed/i);
      assert.equal(await readFile(file, 'utf8'), '{"tasks":[');
    } finally {
      await rm(tempDir, { recursive: true, force: true });
    }
  });

  it('reports unreadable storage paths gracefully', async () => {
    const tempDir = await mkdtemp(join(tmpdir(), 'task-test-'));
    try {
      const file = join(tempDir, 'tasks.json');
      await mkdir(file);
      const cli = new CLI(file);
      const result = await cli.taskManager.initialize();

      assert.equal(result.success, false);
      assert.match(result.error, /read|file|storage/i);
    } finally {
      await rm(tempDir, { recursive: true, force: true });
    }
  });

  it('reports storage creation and write failures', async () => {
    const tempDir = await mkdtemp(join(tmpdir(), 'task-test-'));
    try {
      const blocked = join(tempDir, 'blocked');
      await writeFile(blocked, 'not a directory', 'utf8');
      const cli = new CLI(join(blocked, 'tasks.json'));
      const result = await cli.taskManager.initialize();

      assert.equal(result.success, false);
      assert.match(result.error, /write|create|storage|directory/i);
    } finally {
      await rm(tempDir, { recursive: true, force: true });
    }
  });
});
