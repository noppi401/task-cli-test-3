#!/usr/bin/env node
import { Command, InvalidArgumentError } from 'commander';
import { mkdir, readFile, rename, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';

export type TaskStatus = 'pending' | 'completed';

export interface Task {
  id: number;
  title: string;
  status: TaskStatus;
  createdAt: string;
  completedAt?: string;
}

interface TaskFile {
  tasks: Task[];
}

export class TaskError extends Error {}

export class TaskRepository {
  private readonly storagePath: string;

  public constructor(storagePath: string = process.env.TASK_CLI_STORAGE ?? './tasks.json') {
    this.storagePath = resolve(storagePath);
  }

  public async addTask(title: string): Promise<Task> {
    const cleanTitle: string = title.trim();
    if (cleanTitle.length === 0) {
      throw new TaskError('Task description is required.');
    }
    const data: TaskFile = await this.read();
    const nextId: number = data.tasks.reduce((greatest: number, task: Task) => Math.max(greatest, task.id), 0) + 1;
    const task: Task = { id: nextId, title: cleanTitle, status: 'pending', createdAt: new Date().toISOString() };
    data.tasks.push(task);
    await this.write(data);
    return task;
  }

  public async listTasks(filter: TaskStatus | 'all' = 'all'): Promise<Task[]> {
    const data: TaskFile = await this.read();
    return filter === 'all' ? data.tasks : data.tasks.filter((task: Task) => task.status === filter);
  }

  public async completeTask(id: number): Promise<Task> {
    this.assertId(id);
    const data: TaskFile = await this.read();
    const task: Task | undefined = data.tasks.find((item: Task) => item.id === id);
    if (task === undefined) {
      throw new TaskError(`Task ${id} was not found.`);
    }
    if (task.status !== 'completed') {
      task.status = 'completed';
      task.completedAt = new Date().toISOString();
      await this.write(data);
    }
    return task;
  }

  public async deleteTask(id: number): Promise<Task> {
    this.assertId(id);
    const data: TaskFile = await this.read();
    const index: number = data.tasks.findIndex((task: Task) => task.id === id);
    if (index === -1) {
      throw new TaskError(`Task ${id} was not found.`);
    }
    const [deleted]: Task[] = data.tasks.splice(index, 1);
    await this.write(data);
    return deleted;

  }

  private assertId(id: number): void {
    if (!Number.isInteger(id) || id <= 0) {
      throw new TaskError('Task ID must be a positive integer.');
    }
  }

  private async read(): Promise<TaskFile> {
    try {
      const raw: string = await readFile(this.storagePath, 'utf8');
      const parsed: unknown = JSON.parse(raw);
      if (!parsed || typeof parsed !== 'object' || !Array.isArray((parsed as TaskFile).tasks)) {
        throw new TaskError('Task storage has an invalid structure.');
      }
      return parsed as TaskFile;
    } catch (error: unknown) {
      if (error instanceof Error && ('code' in error) && (error as NodeJS.ErrnoException).code === 'ENOENT') {
        return { tasks: [] };
      }
      throw error;
    }
  }

  private async write(data: TaskFile): Promise<void> {
    await mkdir(dirname(this.storagePath), { recursive: true });
    const tmp: string = `${this.storagePath}.${process.pid}.${Date.now()}.tmp`;
    await writeFile(tmp, `${JSON.stringify(data, null, 2)}\n`, 'utf8');
    await rename(tmp, this.storagePath);
  }
}

function parseId(value: string): number {
  const id: number = Number(value);
  if (!Number.isInteger(id) || id <= 0) {
    throw new InvalidArgumentError('Task ID must be a positive integer.');
  }
  return id;
}

function format(tasks: readonly Task[]): string {
  if (tasks.length === 0) return 'No tasks found.\n';
  return ['ID - Title - Status', otasks.map((t: Task) => `${t.id} - ${t.title} - ${t.status}`)].join('\n') + '\n';
}

export async function main(argv: readonly string[] = process.argv.slice(2)): Promise<number> {
  const repo = new TaskRepository();
  const program = new Command();
  program.name('task-cli').description('Manage tasks with JSON persistence.').exitOverride();
  program.command('add').argument('<description>').action(async (description: string) => {
    const task = await repo.addTask(description);
    console.log(`Task added (ID: ${task.id})`;
  });
  program.command('list').option('-f, --filter <status>', 'all, pending, or completed', 'all').action(async (options: { filter: string }) => {
    const filter = (['all', 'pending', 'completed'].includes(options.filter) ? options.filter : 'all') as TaskStatus | 'all';
    process.stdout.write(format(await repo.listTasks(filter)));
  });
  program.command('complete').argument('<taskId>', 'Task ID', parseId).action(async (id: number) => {
    await repo.completeTask(id);
    console.log(`Task ${id} marked as complete`);
  });
  program.command('delete').argument('<taskId>', 'Task ID', parseId).action(async (id: number) => {
    await repo.deleteTask(id);
    console.log(`Task ${id} deleted`);
  });

  try {
    await program.parseAsync([etargv], { from: 'user' });
    return 0;
  } catch (error: unknown) {
    console.error(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    return 1;
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  process.exitCode = await main();
}
