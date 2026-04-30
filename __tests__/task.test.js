import { mkdtemp, rm, readFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { TaskRepository, TASK_STATUS } from '../lib/task.js';

describe('TaskRepository', () => {
  let dir;
  let storagePath;

  beforeEach(async () => {
    dir = await mkdtemp(join(tmpdir(), 'task-cli-'));
    storagePath = join(dir, 'tasks.json');
  });

  afterEach(async () => {
    await rm(dir, { recursive: true, force: true });
  });

  it('adds, lists, completes, deletes, and persists tasks', async () => {
    const repository = new TaskRepository({ storagePath });

    const task = await repository.addTask('Buy groceries');
    expect(task).toMatchObject({ id: 1, title: 'Buy groceries', status: TASK_STATUS.PENDING });

    await repository.completeTask(1);
    expect(await repository.listTasks(TASK_STATUS.COMPLETED)).toHaveLength(1);

    await repository.deleteTask(1);
    expect(await repository.listTasks()).toHaveLength(0);

    const data = JSON.parse(await readFile(storagePath, 'utf8'));
    expect(data.tasks).toEqual([]);
  });

  it('rejects empty task titles', async () => {
    const repository = new TaskRepository({ storagePath });
    await expect(repository.addTask('   ')).rejects.toThrow('Task description is required');
  });
});
