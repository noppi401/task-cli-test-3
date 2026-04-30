import { promises as fs } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { TaskStore } from '../lib/tasks.js';

describe('TaskStore', () => {
  let tempDir: string;
  let taskFile: string;

  beforeEach(async (): Promise<void> => {
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'task-cli-'));
    taskFile = path.join(tempDir, 'tasks.json');
  });

  afterEach(async (): Promise<void> => {
    await fs.rm(tempDir, { recursive: true, force: true });
  });

  it('adds, lists, completes, and deletes tasks with persistence', async (): Promise<void> => {
    const store = new TaskStore(taskFile);
    const added = await store.addTask('Buy groceries');
    expect(added).toMatchObject({ id: 1, title: 'Buy groceries', status: 'pending' });

    const reloaded = new TaskStore(taskFile);
    expect(await reloaded.listTasks()).toHaveLength(1);

    const completed = await reloaded.completeTask(1);
    expect(completed.status).toBe('completed');
    expect(completed.completedAt).toEqual(expect.any(String));

    expect(await reloaded.listTasks('pending')).toHaveLength(0);
    expect(await reloaded.listTasks('completed')).toHaveLength(1);

    const deleted = await reloaded.deleteTask(1);
    expect(deleted.id).toBe(1);
    expect(await reloaded.listTasks()).toEqual([]);
  });

  it('rejects empty task descriptions', async (): Promise<void> => {
    const store = new TaskStore(taskFile);
    await expect(store.addTask('   ')).rejects.toThrow('Task description must not be empty.');
  });
});
