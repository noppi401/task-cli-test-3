import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DEFAULT_TASKS_FILE = path.join(process.cwd(), 'tasks.json');

export class TaskManager {
  constructor(tasksFile = DEFAULT_TASKS_FILE) {
    this.tasksFile = tasksFile;
  }

  async load() {
    try {
      const data = await fs.readFile(this.tasksFile, 'utf-8');
      const json = JSON.parse(data);
      return json.tasks || [];
    } catch (error) {
      if (error.code === 'ENOENT') {
        return [];
      }
      throw new Error(`Failed to read tasks file: ${error.message}`);
    }
  }

  async save(tasks) {
    try {
      const dir = path.dirname(this.tasksFile);
      await fs.mkdir(dir, { recursive: true });
      const data = { tasks: tasks, lastUpdated: new Date().toISOString() };
      await fs.writeFile(this.tasksFile, JSON.stringify(data, null, 2), 'utf-8');
    } catch (error) {
      throw new Error(`Failed to save tasks: ${error.message}`);
    }
  }

  async addTask(title) {
    const tasks = await this.load();
    const id = tasks.length > 0 ? Math.max(...tasks.map(t => t.id)) + 1 : 1;
    const newTask = {
      id,
      title: title.trim(),
      status: 'pending',
      createdAt: new Date().toISOString(),
    };
    tasks.push(newTask);
    await this.save(tasks);
    return newTask;
  }

  async listTasks(filter = 'all') {
    const tasks = await this.load();
    if (filter === 'pending') {
      return tasks.filter(t => t.status === 'pending');
    }
    if (filter === 'completed') {
      return tasks.filter(t => t.status === 'completed');
    }
    return tasks;
  }

  async completeTask(taskId) {
    const tasks = await this.load();
    const task = tasks.find(t => t.id === taskId);
    if (!task) {
      throw new Error(`Task ${taskId} not found`);
    }
   uCYtus = 'completed';
    task.completedAt = new Date().toISOString();
    await this.save(tasks);
    return task;
  }

  async deleteTask(taskId) {
    const tasks = await this.load();
    const index = tasks.findIndex(t => t.id === taskId);
    if (index === -1) {
      throw new Error(`Task ${taskId} not found`);
    }
    const deleted = tasks.splice(index, 1)[0];
    await this.save(tasks);
    return deleted;
  }

  async getTask(taskId) {
    const tasks = await this.load();
    return tasks.find(t => t.id === taskId);
  }
}