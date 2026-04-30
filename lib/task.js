import { access, mkdir, readFile, rename, writeFile } from 'node:fs/promises';
import { constants } from 'node:fs';
import { dirname, resolve } from 'node:path';

export const TASK_STATUS = Object.freeze({
  PENDING: 'pending',
  COMPLETED: 'completed'
});

const DEFAULT_STORAGE_PATH = resolve(process.env.TASK_CLI_STORAGE_FILE || 'tasks.json');

class TaskStorageError extends Error {
  /**
   * @param {string} message
   * @param {unknown} [cause]
   */
  constructor(message, cause) {
    super(message);
    this.name = 'TaskStorageError';
    this.cause = cause;
  }
}

export { TaskStorageError };

/**
 * @module lib/task
 * @typedef {Object} Task
 * @property {number} id
 * @property {string} title
 * @property {'pending'|'completed'} status
 * @property {string} createdAt
 * @property {string | null} completedAt
 */

function normalizeTask(rawTask) {
  if (!rawTask || typeof rawTask !== 'object') {
    throw new TaskStorageError('Invalid task data in storage.');
  }

  const id = Number(rawTask.id);
  const title = typeof rawTask.title === 'string' ? rawTask.title.trim() : '';
  const status = rawTask.status;

  if (!Number.isSafeInteger(id) || id < 1 || title.length === 0) {
    throw new TaskStorageError('Invalid task data in storage.');
  }

  if (status !== TASK_STATUS.PENDING && status !== TASK_STATUS.COMPLETED) {
    throw new TaskStorageError('Invalid task status in storage.');
  }

  return {
    id,
    title,
    status,
    createdAt: typeof rawTask.createdAt === 'string' ? rawTask.createdAt : new Date().toISOString(),
    completedAt: typeof rawTask.completedAt === 'string' ? rawTask.completedAt : null
  };
}

function cloneTask(task) {
  return { ...task };
}

async function fileExists(filePath) {
  try {
    await access(filePath, constants.F_OK);
    return true;
  } catch (error) {
    if (error && error.code === 'ENOENT') return false;
    throw new TaskStorageError('Unable to access task storage file.', error);
  }
}

/**
 * JSON-file-backed task repository with an in-memory working set.
 */
export class TaskRepository {
  /**
   * @param {{ storagePath?: string }} [options]={}
   */
  constructor(options = {}) {
    this.storagePath = resolve(options.storagePath ?? DEFAULT_STORAGE_PATH);
    this.tasks = [];
    this.loaded = false;
  }

  /** Loads tasks from disk or creates an empty store when missing. */
  async load() {
    if (this.loaded) return;

    if (!(await fileExists(this.storagePath))) {
      this.tasks = [];
      this.loaded = true;
      await this.save();
      return;
    }

    try {
      const content = await readFile(this.storagePath, 'utf8');
      const parsed = content.trim().length === 0 ? { tasks: [] } : JSON.parse(content);
      const rawTasks = Array.isArray(parsed) ? parsed : parsed.tasks;

      if (!Array.isArray(rawTasks)) {
        throw new TaskStorageError('Task storage must contain a tasks array.');
      }

      this.tasks = rawTasks.map(normalizeTask);
      this.loaded = true;
    } catch (error) {
      if (error instanceof TaskStorageError) throw error;
      throw new TaskStorageError('Failed to load task storage.',
error);
    }
  }

  async ensureLoaded() {
    if (!this.loaded) await this.load();
  }

  /** Persists the in-memory task array to disk using an atomic rename. */
  async save() {
    try {
      await mkdir(dirname(this.storagePath), { recursive: true });
      const payload = JSON.stringify({ tasks: this.tasks }, null, 2) + '\n';
      const tempPath = `${this.storagePath}.tmp-${process.pid}-${Date.now()}`;
      await writeFile(tempPath, payload, { encoding: 'utf8', mode: 0o600 });
      await rename(tempPath, this.storagePath);
    } catch (error) {
      throw new TaskStorageError('Failed to save task storage.',
error);
    }
  }

  /** @returns {Promise<Task[]>} */
  async listTasks(filter = 'all') {
    await this.ensureLoaded();
    const validFilters = new Set(['all', TASK_STATUS.PENDING, TASK_STATUS.COMPLETED]);
    if (!validFilters.has(filter)) {
      throw new TaskStorageError(`Invalid filter: ${filter}`);
    }
    const results = filter === 'all' ? this.tasks : this.tasks.filter((task) => task.status === filter);
    return results.map(cloneTask);
  }

  /** @creates and persists a new task. */
  async addTask(title) {
    await this.ensureLoaded();
    const normalizedTitle = typeof title === 'string' ? title.trim() : '';
    if (normalizedTitle.length === 0) {
      throw new TaskStorageError('Task description is required.');
    }

    const nextId = this.tasks.reduce((maxId, task) => Math.max(maxId, task.id), 0) + 1;
    const task = {
      id: nextId,
      title: normalizedTitle,
      status: TASK_STATUS.PENDING,
      createdAt: new Date().toISOString(),
      completedAt: null
    };

    this.tasks.push(task);
    await this.save();
    return cloneTask(task);
  }

  /** Marks a task as completed and persists the change. */
  async completeTask(id) {
    await this.ensureLoaded();
    const task = this.findTaskById(id);
    if (!task) throw new TaskStorageError(`Task ${id} not found.`);

    task.status = TASK_STATUS.COMPLETED;
    task.completedAt = new Date().toISOString();
    await this.save();
    return cloneTask(task);
  }

  /** Deletes a task and persists the change. */
  async deleteTask(id) {
    await this.ensureLoaded();
    const index = this.tasks.findIndex((task) => task.id === Number(id));
    if (index === -1) throw new TaskStorageError(`Task ${id} not found.`);

    const [deleted] = this.tasks.splice(index, 1);
    await this.save();
    return cloneTask(deleted);
  }

  findTaskById(id) {
    const numericId = Number(id);
    if (!Number.isSafeInteger(numericId) || numericId < 1) {
      throw new TaskStorageError('Task id must be a positive integer.');
    }
    return this.tasks.find((task) => task.id === numericId);
  }
}

export function createTaskRepository(options = {}) {
  return new TaskRepository(options);
}
