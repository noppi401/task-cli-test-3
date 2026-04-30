import { promises as fs } from 'node:fs';
import path from 'node:path';

export type TaskStatus = 'pending' | 'completed';

export interface Task {
  id: number;
  title: string;
  status: TaskStatus;
  createdAt: string;
  completedAt?: string;
}

export interface TaskFileData {
  tasks: Task[];
}

export type TaskFilter = 'all' | TaskStatus;

export class TaskValidationError extends Error {
  public constructor(message: string) {
    super(message);
    this.name = 'TaskValidationError';
  }
}

export class TaskNotFoundError extends Error {
  public constructor(id: number) {
    super(`Task ${id} was not found.`);
    this.name = 'TaskNotFoundError';
  }
}

/** JSON-backed task repository with immediate persistence. */
export class TaskStore {
  private readonly filePath: string;

  public constructor(filePath: string = path.resolve(process.cwd(), 'tasks.json')) {
    this.filePath = path.resolve(filePath);
  }

  public async addTask(title: string): Promise<Task> {
    const trimmed = title.trim();
    if (trimmed.length === 0) throw new TaskValidationError('Task description must not be empty.');
    const data = await this.readData();
    const now = new Date().toISOString();
    const task: Task = { id: this.nextId(data.tasks), title: trimmed, status: 'pending', createdAt: now };
    data.tasks.push(task);
    await this.writeData(data);
    return task;
  }

  public async listTasks(filter: TaskFilter = 'all'): Promise<Task[]> {
    const data = await this.readData();
    return filter === 'all' ? data.tasks : data.tasks.filter((task) => task.status === filter);
  }

  public async completeTask(id: number): Promise<Task> {
    this.validateId(id);
    const data = await this.readData();
    const task = data.tasks.find((current) => current.id === id);
    if (!task) throw new TaskNotFoundError(id);
    task.status = 'completed';
    task.completedAt = task.completedAt ?? new Date().toISOString();
    await this.writeData(data);
    return task;
  }

  public async deleteTask(id: number): Promise<Task> {
    this.validateId(id);
    const data = await this.readData();
    const index = data.tasks.findIndex((task) => task.id === id);
    if (index === -1) throw new TaskNotFoundError(id);
    const [deleted] = data.tasks.splice(index, 1);
    await this.writeData(data);
    return deleted;
  }

  private validateId(id: number): void {
    if (!Number.isInteger(id) || id <= 0) throw new TaskValidationError('Task ID must be a positive integer.');
  }

  private nextId(tasks: Task[]): number {
    return tasks.reduce((max, task) => Math.max(max, task.id), 0) + 1;
  }

  private async readData(): Promise<TaskFileData> {
    try {
      const raw = await fs.readFile(this.filePath, 'utf8');
      const parsed: unknown = JSON.parse(raw);
      return this.normalizeData(parsed);
    } catch (error: unknown) {
      if (error instanceof Error && 'code' in error && (error as NodeJS.ErrnoException).code === 'ENOENT') return { tasks: [] };
      if (error instanceof SyntaxError) throw new Error(`Task file contains invalid JSON: ${this.filePath}`);
      throw error instanceof Error ? error : new Error(String(error));
    }
  }

  private async writeData(data: TaskFileData): Promise<void> {
    const dir = path.dirname(this.filePath);
    const tmp = `${this.filePath}.${process.pid}.tmp`;
    await fs.mkdir(dir, { recursive: true });
    await fs.writeFile(tmp, `${JSON.stringify(data, null, 2)}\n`, 'utf8');
    await fs.rename(tmp, this.filePath);
  }

  private normalizeData(value: unknown): TaskFileData {
    if (typeof value !== 'object' || value === null || !(Array.isArray((value as { tasks?: unknown }).tasks))) {
      throw new Error('Task file must contain an object with a tasks array.');
    }
    return { tasks: (value as TaskFileData).tasks };
  }
}
