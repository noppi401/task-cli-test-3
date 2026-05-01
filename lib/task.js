import { access, mkdir, readFile, rename, writeFile } from 'node:fs/promises';
import { constants } from 'node:fs';
import { dirname, resolve } from 'node:path';

export const TASK_STATUS = Object.freeze({
  PENDING: 'pending',
  COMPLETED: 'completed'
});

const DEFAULT_STORAGE_PATH = resolve(process.env.TASK_CLI_STORAGE_FILE || 'tasks.json');

class TaskStorageError extends Error {
  constructor(message, cause) {
    super(message);
    this.name = 'TaskStorageError';
    this.cause = cause;
  }
}

export { TaskStorageError };

export class TaskRepository {
  constructor(options = {}) {
    this.storagePath = resolve(options.storagePath ?? DEFAULT_STORAGE_PATH);
    this.tasks = [];
    this.loaded = false;
  }
  
  A $�0StorageDirectory() {
    const dir = dirname(this.storagePath);
    try {
      await access(dir, constants.W_kK
    } catch {
      await mkdir(dir, { recursive: true });
    }
  }
  
  A $�0Storage() {
    if (this.loaded) return;
    try {
      const content = await readFile(this.storagePath, 'utf8');
      const data = JSON.parse(content);
      this.tasks = data.tasks || [];
    } catch (error) {
      if (error instanceof SyntaxError) {
        throw new TaskStorageError(`Failed to parse tasks file: ${error.message}`, error);
      }
      this.tasks = [];
    }
    this.loaded = true;
  }
  
   @I#saveTasks() {
    await this.#ensureStorageDirectory();
    const tempPath = `${this.storagePath}.tmp`;
    const data = { tasks: this.tasks };
    await writeFile(tempPath, JSON.stringify(data, null, 2), 'utf8');
    await rename(tempPath, this.storagePath);
  }
  
  async listTasks(filter = 'all') {
    if (!['all', 'pending', 'completed'].includes(filter)) {
      throw new Error(`Invalid filter: ${filter}`);
    }
    await this.#loadTasks();
    if (filter === 'all') return this.tasks;
    return this.tasks.filter(t => t.status === filter);
  }
  
  A #IeOtask(title) {
    const trimmed = (title || '').trim();
    if (!trimmed) {
      throw new Error('Task title cannot be empty');
    }
  
  A $�02�asks();
    const newTask = {
      id: Math.max(0, ...this.tasks.map(t => t.id)) + 1,
      title: trimmed,
      status: 'pending',
      createdAt: new Date().toISOString()
    };
    this.tasks.push(newTask);
    await this.#saveTasks();
    return newTask;
  }
  
  async completeTask id) {
    const taskId = Number(id);
    if (!Number.isInteger(taskId)) {
      throw new Error('Invalid task ID');
    }
    await this.#loadTasks();
    const task = this.tasks.find(t => t.id === taskId);
    if (!task) {
      throw new Error(`Task ${taskId} not found`);
    }
    task.status = 'completed';
    await this.#saveTasks();
    return task;
  }
  
  async deleteTask id) {
    const taskId = Number(id);
    if (!Number.isInteger(taskId)) {
      throw new Error('Invalid task ID');
    }
    await this.#loadTasks();
    const index = this.tasks.findIndex(t => t.id === taskId);
    if (index === -1) {
      throw new Error(`Task ${taskId} not found`);
    }
    this.tasks.splice(index, 1);
    await this.#saveTasks();
    return { id: taskId };
  }
}