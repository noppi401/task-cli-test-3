import { mkdir, readFile, rename, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { FilterType, Task, TaskStore as TaskFileData } from './types.js';

export class TaskValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'TaskValidationError';
  }
}

export class TaskNotFoundError extends Error {
  constructor(id: number) {
    super(`Task ${id} not found`);
    this.name = 'TaskNotFoundError';
  }
}

export class TaskStore {
  private readonly filePath: string;

  constructor(filePath: string = './tasks.json') {
    this.filePath = path.resolve(filePath);
  }

  async addTask(title: string): Promise<Task> {
    const cleanTitle = title.trim();
    if (cleanTitle.length === 0) {
      throw new TaskValidationError('Task description is required');
    }

    const data = await this.loadTasks();
    const task: Task = {
      id: this.getNextId(data.tasks),
      title: cleanTitle,
      status: 'pending',
      createdAt: new Date().toISOString()
    };

    data.tasks.push(task);
    await this.saveTasks(data);
    return task;
  }

  async listTasks(filter: FilterType = 'all'): Promise<Task[]> {
    const data = await this.loadTasks();
    if (filter === 'all') {
      return data.tasks;
    }
    return data.tasks.filter((task) => task.status === filter);
  }

  async completeTask(id: number): Promise<Task> {
    this.validateId(id);
    const data = await this.loadTasks();
    const task = data.tasks.find((item) => item.id === id);
    if (!task) {
      throw new TaskNotFoundError(id);
    }

    task.status = 'completed';
    await this.saveTasks(data);
    return task;
  }

  async deleteTask(id: number): Promise<Task> {
    this.validateId(id);
    const data = await this.loadTasks();
    const index = data.tasks.findIndex((item) => item.id === id);
    if (index === -1) {
      throw new TaskNotFoundError(id);
    }

    const [deletedTask] = data.tasks.splice(index, 1);
    await this.saveTasks(data);
    return deletedTask;
  }

  private async loadTasks(): Promise<TaskFileData> {
    try {
      const raw = await readFile(this.filePath, 'utf8');
      const parsed: unknown = JSON.parse(raw);
      return this.normalizeTaskData(parsed);
    } catch (error) {
      if (isNodeError(error) && error.code === 'ENOENT') {
        return { tasks: [] };
      }
      if (error instanceof SyntaxError) {
        throw new Error(`Task file contains invalid JSON: ${this.filePath}`);
      }
      throw error;
    }
  }

  private async saveTasks(data: TaskFileData): Promise<void> {
    const directory = path.dirname(this.filePath);
    const tempPath = `${this.filePath}.${process.pid}.tmp`;
    await mkdir(directory, { recursive: true });
    await writeFile(tempPath, `${JSON.stringify(data, null, 2)}\n`, 'utf8');
    await rename(tempPath, this.filePath);
  }

  private getNextId(tasks: Task[]): number {
    return tasks.reduce((maxId, task) => Math.max(maxId, task.id), 0) + 1;
  }

  private validateId(id: number): void {
    if (!Number.isInteger(id) || id <= 0) {
      throw new TaskValidationError('Task ID must be a positive integer');
    }
  }

  private normalizeTaskData(value: unknown): TaskFileData {
    if (!isTaskFileData(value)) {
      throw new Error('Task file must contain an object with a tasks array');
    }
    return { tasks: value.tasks };
  }
}

function isTaskFileData(value: unknown): value is TaskFileData {
  return typeof value === 'object' && value !== null && Array.isArray((value as { tasks?: unknown }).tasks);
}

function isNodeError(error: unknown): error is NodeJS.ErrnoException {
  return error instanceof Error && 'code' in error;
}
