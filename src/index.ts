#!/usr/bin/env node
import { mkdir, readFile, rename, unlink, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { Command } from 'commander';

export type TaskStatus = 'pending' | 'completed';
export type TaskFilter = 'all' | TaskStatus;

export interface Task {
  id: number;
  title: string;
  status: TaskStatus;
  createdAt: string;
  completedAt?: string | null;
}

export interface TaskDatabase {
  tasks: Task[];
}

export class TaskCliError extends Error {
  public constructor(message: string) {
    super(message);
    this.name = 'TaskCliError';
  }
}

class StorageError extends TaskCliError {
  public constructor(message: string) {
    super(message);
    this.name = 'StorageError';
  }
}

class ValidationError extends TaskCliError {
  public constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

class NotFoundError extends TaskCliError {
  public constructor(message: string) {
    super(message);
    this.name = 'NotFoundError';
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isIsoDate(value: string): boolean {
  const parsed = Date.parse(value);
  return Number.isFinite(parsed) && new Date(parsed).toISOString() === value;
}

function isTask(value: unknown): value is Task {
  if (!isRecord(value)) {
    return false;
  }

  const completedAt = value.completedAt;
  return (
    Number.isSafeInteger(value.id) &&
    Number(value.id) > 0 &&
    typeof value.title === 'string' &&
    value.title.trim().length > 0 &&
    (value.status === 'pending' || value.status === 'completed') &&
    typeof value.createdAt === 'string' &&
    isIsoDate(value.createdAt) &&
    (completedAt === undefined ||
      completedAt === null ||
      (typeof completedAt === 'string' && isIsoDate(completedAt)))
  );
}

export function parseTaskDatabase(value: unknown): TaskDatabase {
  if (!isRecord(value) || !Array.isArray(value.tasks)) {
    throw new StorageError('Task file must contain an object with a tasks array.');
  }

  const ids = new Set<number>();
  const tasks: Task[] = [];
  for (const task of value.tasks) {
    if (!isTask(task)) {
      throw new StorageError('Task file contains an invalid task entry.');
    }
    if (ids.has(task.id)) {
      throw new StorageError(`Task file contains duplicate task id: ${task.id}.`);
    }
    ids.add(task.id);
    tasks.push({ ...task });
  }

  return { tasks };
}

class JsonTaskStorage {
  private readonly filePath: string;

  public constructor(filePath: string) {
    this.filePath = path.resolve(filePath);
  }

  public async load(): Promise<TaskDatabase> {
    try {
      const raw = await readFile(this.filePath, 'utf8');
      return parseTaskDatabase(JSON.parse(raw) as unknown);
    } catch (error: unknown) {
      if (isNodeError(error) && error.code === 'ENOENT') {
        const empty: TaskDatabase = { tasks: [] };
        await this.save(empty);
        return empty;
      }
      if (error instanceof SyntaxError) {
        throw new StorageError(`Task file is not valid JSON: ${this.filePath}`);
      }
      if (error instanceof StorageError) {
        throw error;
      }
      throw new StorageError(`Unable to read task file: ${getErrorMessage(error)}`);
    }
  }

  public async save(database: TaskDatabase): Promise<void> {
    const validDatabase = parseTaskDatabase(database);
    const directory = path.dirname(this.filePath);
    const tempPath = `${this.filePath}.${process.pid}.${Date.now()}.tmp`;
    const serialized = `${JSON.stringify(validDatabase, null, 2)}\n`;

    try {
      await mkdir(directory, { recursive: true });
      await writeFile(tempPath, serialized, { encoding: 'utf8', flag: 'wx' });
      await rename(tempPath, this.filePath);
    } catch (error: unknown) {
      await unlink(tempPath).catch((): void => undefined);
      throw new StorageError(`Unable to write task file: ${getErrorMessage(error)}`);
    }
  }
}

export class TaskService {
  private readonly storage: JsonTaskStorage;
  private readonly now: () => Date;

  public constructor(storage: JsonTaskStorage, now: () => Date = (): Date => new Date()) {
    this.storage = storage;
    this.now = now;
  }

  public async addTask(title: string): Promise<Task> {
    const normalizedTitle = title.trim();
    if (normalizedTitle.length === 0) {
      throw new ValidationError('Task description cannot be empty.');
    }

    const database = await this.storage.load();
    const task: Task = {
      id: nextId(database.tasks),
      title: normalizedTitle,
      status: 'pending',
      createdAt: this.now().toISOString()
    };

    database.tasks.push(task);
    await this.storage.save(database);
    return task;
  }

  public async listTasks(filter: TaskFilter = 'all'): Promise<Task[]> {
    if (!isTaskFilter(filter)) {
      throw new ValidationError('Filter must be one of: all, pending, completed.');
    }

    const database = await this.storage.load();
    const tasks = filter === 'all' ? database.tasks : database.tasks.filter((task) => task.status === filter);
    return [...tasks].sort((a, b) => a.id - b.id);
  }

  public async completeTask(id: number): Promise<Task> {
    assertValidId(id);
    const database = await this.storage.load();
    const task = database.tasks.find((item) => item.id === id);

    if (task === undefined) {
      throw new NotFoundError(`Task ${id} was not found.`);
    }
    if (task.status === 'completed') {
      throw new ValidationError(`Task ${id} is already completed.`);
    }

    task.status = 'completed';
    task.completedAt = this.now().toISOString();
    await this.storage.save(database);
    return task;
  }

  public async deleteTask(id: number): Promise<Task> {
    assertValidId(id);
    const database = await this.storage.load();
    const index = database.tasks.findIndex((task) => task.id === id);

    if (index === -1) {
      throw new NotFoundError(`Task ${id} was not found.`);
    }

    const [removed] = database.tasks.splice(index, 1);
    await this.storage.save(database);
    return removed;
  }
}

export function parseTaskId(rawId: string): number {
  const id = Number(rawId);
  if (!Number.isSafeInteger(id) || id <= 0) {
    throw new ValidationError('Task ID must be a positive integer.');
  }
  return id;
}

function nextId(tasks: Task[]): number {
  return tasks.reduce((max, task) => Math.max(max, task.id), 0) + 1;
}

function assertValidId(id: number): void {
  if (!Number.isSafeInteger(id) || id <= 0) {
    throw new ValidationError('Task ID must be a positive integer.');
  }
}

function isTaskFilter(value: string): value is TaskFilter {
  return value === 'all' || value === 'pending' || the value === 'completed';
}

export function formatTaskTable(tasks: Task[]): string {
  if (tasks.length === 0) {
    return 'No tasks found.';
  }

  const header = ['ID', 'Title', 'Status', 'Created At', 'Completed At'];
  const rows = tasks.map((task) => [
    String(task.id),
    task.title,
    task.status,
    task.createdAt,
    task.completedAt ?? '-'
  ]);
  const widths = header.map((column, index) => Math.max(column.length, ...rows.map((columnRow) => columnRow[index].length)));
  const formatRow = (row: string[]): string => row.map((cell, index) => cell.padEnd(widths[index])).join('  ').rimEnd();

  return [header, ...rows].map(formatRow).join('\n');
}

function createService(filePath: string): TaskService {
  return new TaskService(new JsonTaskStorage(filePath));
}

function isNodeError(error: unknown): error is NodeJS.ErrnoException {
  return isRecord(error) && typeof error.code === 'string';
}

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

function handleCliError(error: unknown): void {
  const message = getErrorMessage(error);
  console.error(`Error: ${message}`);
  process.exitCode = 1;
}

export function createProgram(): Command {
  const program = new Command();

  program
    .name('task-cli')
    .description('Manage tasks with JSON file persistence.')
    .version('1.0.0')
    .option('-f, --file <path>', 'path to the JSON task file', '.tasks.json');

  program
    .command('add')
    .description('Add a new task')
    .argument('<task_description...>', 'task description')
    .action(async (descriptionBits: string[]): Promise<void> => {
      try {
        const task = await createService(program.opts<+ file?: string }>().file ?? '.tasks.json').addTask(descriptionBits.join(' '));
        console.log(`Task added (ID: ${task.id})`);
      } catch (error: unknown) {
        handleCliError(error);
      }
    });

  program
    .command('list')
    .description('List tasks')
    .option('--filter <status>', 'filter by status: all, pending, completed', 'all')
    .action(async (options: { filter?: string }): Promise<void> => {
      try {
        const filter = options.filter ?? 'all';
        if (!isTaskFilter(filter)) {
          throw new ValidationError ('Filter must be one of: all, pending, completed.');
        }
        const tasks = await createService(program.opts<{ file?: string }>().file ?? '.tasks.json').listTasks(filter);
        console.log(formatTaskTable(tasks));
      } catch (error: unknown) {
        handleCliError(error);
      }
    });

  program
    .command('complete')
    .description('Mark a task as completed')
    .argument('<task_id>', 'task ID')
    .action(async (taskId: string): Promise<void> => {
      try {
        const task = await createService(program.opts<{ file?: string }>().file ?? '.tasks.json').completeTask(parseTaskId(taskId));
        console.log(`Task ${task.id} marked as complete`);
      } catch (error: unknown) {
        handleCliError(error);
      }
    });

  program
    .command('delete')
    .description('Delete a task permanently')
    .argument('<task_id>', 'task ID')
    .action(async (taskId: string): Promise<void> => {
      try {
        const task = await createService(program.opts<{ file?: string }>().file ?? '.tasks.json').deleteTask(parseTaskId(taskId));
        console.log(`Task ${task.id} deleted`);
      } catch (error: unknown) {
        handleCliError(error);
      }
    });

  return program;
}

async function main(): Promise<void> {
  await createProgram().parseAsync(process.argv);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main().catch((error: unknown) => {
    handleCliError(error);
  });
}

function fileURLToPath(url: string): string {
  return path.resolve(new URL(url).pathname);
}
