import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from '@jest/globals';
import { TaskService, parseTaskDatabase, formatTaskTable } from '../index.js';

let tempDir: string;
let taskFile: string;

class TestStorage {
  public constructor(private readonly filePath: string) {}

  public async load() {
    try {
      const raw = await readFile(this.filePath, 'utf8');
      return parseTaskDatabase(JSON.parse(raw) as unknown);
    } catch (error: unknown) {
      const fileError = error as NodeJS.ErrnoException;
      if (fileError.code === 'ENOENT') {
        const empty = { tasks: [] };
        await this.save(empty);
        return empty;
      }
      throw error;
    }
  }

  public async save(database: { tasks: unknown[] }): Promise<void> {
    await writeFile(this.filePath, `${JSON.stringify(database, null, 2)}\n`, 'utf8');
  }
}

beforeEach(async () => {
  tempDir = await mkdtemp(path.join(os.tmpdir(), 'task-cli-'));
  taskFile = path.join(tempDir, 'tasks.json');
});

afterEach(async () => {
  await rm(tempDir, { recursive: true, force: true });
});

function createService(): TaskService {
  const dates = [
    new Date('2026-04-30T00:00:00.000Z'),
    new Date('2026-04-30T01:00:00.000Z'),
    new Date('2026-04-30T02:00:00.000Z')
  ];
  return new TaskService(new TestStorage(taskFile) as never, () => dates.shift() ?? new Date('2026-04-30T03:00:00.000Z'));
}

describe('TaskService', () => {
  it('adds, lists, completes, deletes, and persists tasks', async () => {
    const service = createService();
    const first = await service.addTask('Buy groceries');
    const second = await service.addTask('Write report');

    await service.completeTask(first.id);
    const completed = await service.listTasks('completed');
    const pending = await service.listTasks('pending');
    const deleted = await service.deleteTask(second.id);
    const raw = await readFile(taskFile, 'utf8');

    expect(first).toMatchObject({ id: 1, title: 'Buy groceries', status: 'pending' });
    expect(completed).toHaveLength(1);
    expect(completed[0]?.completedAt).toBe('2026-04-30T02:00:00.000Z');
    expect(pending).toHaveLength(1);
    expect(deleted.title).toBe('Write report');
    expect(JSON.parse(raw)).toEqual({ tasks: [completed[0]] });
  });

  it('rejects empty task titles', async () => {
    await expect(createService().addTask('   ')).rejects.toThrow('Task description cannot be empty.');
  });
});

describe('formatTaskTable', () => {
  it('formats a stable table', () => {
    const table = formatTaskTable([{
      id: 1,
      title: 'Buy groceries',
      status: 'pending',
      createdAt: '2026-04-30T00:00:00.000Z'
    }]);

    expect(table).toContain('ID  Title          Status   Created At');
    expect(table).toContain('1   Buy groceries  pending  2026-04-30T00:00:00.000Z');
  });
});
