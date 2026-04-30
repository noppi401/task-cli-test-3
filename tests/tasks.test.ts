import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { afterEach, beforeEach, describe, expect, it } from '@jest/globals';
import { TaskRepository } from '../src/index.js';

describe('TaskRepository', () => {
  let dir = '';
  let path = '';

  beforeEach(async () => {
    dir = await mkdtemp(join(tmpdir(), 'task-cli-'));
    path = join(dir, 'tasks.json');
  });

  afterEach(async () => {
    await rm(dir, { recursive: true, force: true });
  });

  it('completes a task and persists the updated status', async () => {
    const repo = new TaskRepository(path);
    const task = await repo.addTask('Write tests');
    const completed = await repo.completeTask(task.id);
    const stored = JSON.parse(await readFile(path, 'utf8'));

    expect(completed.status).toBe('completed');
    expect(completed.completedAt).toEqual(expect.any(String));
    expect(stored.tasks[0].status).toBe('completed');
  });
});
