import type { TaskFilter } from './types.js';
import { TaskStore, ValidationError } from './tasks.js';
import { formatTaskTable } from './format.js';

export class TaskCLI {
  private readonly store: TaskStore;

  constructor(storePath?: string) {
    this.store = new TaskStore(storePath);
  }

  async init(): Promise<void> {
    await this.store.load();
  }

  async addTask(title: string): Promise<void> {
    if (!title || title.trim() === '') {
      throw new ValidationError('Task title cannot be empty');
    }

    const task = await this.store.addTask(title);
    console.log(`Task added (ID: ${task.id})`);
  }

  async listTasks(filter: TaskFilter = 'all'): Promise<void> {
    const tasks = this.store.getTasks(filter);
    console.log(formatTaskTable(tasks));
  }

  async completeTask(taskId: number): Promise<void> {
    if (!Number.isInteger(taskId) || taskId <= 0) {
      throw new ValidationError('Invalid task ID');
    }

    const task = await this.store.completeTask(taskId);
    console.log(`Task ${task.id} marked as complete`);
  }

  async deleteTask(taskId: number): Promise<void> {
    if (!Number.isInteger(taskId) || taskId <= 0) {
      throw new ValidationError('Invalid task ID');
    }

    const task = await this.store.deleteTask(taskId);
    console.log(`Task ${task.id} deleted`);
  }
}
