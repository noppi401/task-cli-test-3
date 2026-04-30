import fs from 'fs/promises';
import path from 'path';

const TASKS_FILE = './tasks.json';

class TaskManager {
  async loadTasks() {
    try {
      const data = await fs.readFile(TASKS_FILE, 'utf-8');
      return JSON.parse(data).tasks || [];
    } catch (error) {
      if (error.code === 'ENOENT') {
        return [];
      }
      throw error;
    }
  }

  async saveTasks(tasks) {
    const data = { tasks };
    await fs.writeFile(TASKS_FILE, JSON.stringify(data, null, 2), 'utf-8');
  }

  async getNextId() {
    const tasks = await this.loadTasks();
    if (tasks.length === 0) return 1;
    return Math.max(...tasks.map(t => t.id)) + 1;
  }

  async addTask(title) {
    const tasks = await this.loadTasks();
    const id = await this.getNextId();
    const task = {
      id,
      title,
      status: 'pending',
      createdAt: new Date().toISOString()
    };
    tasks.push(task);
    await this.saveTasks(tasks);
    return task;
  }

  async listTasks(filter = null) {
    const tasks = await this.loadTasks();
    if (filter) {
      return tasks.filter(task => task.status === filter);
    }
    return tasks;
  }

  async completeTask(id) {
    const tasks = await this.loadTasks();
    const task = tasks.find(t => t.id === id);
    if (!task) {
      throw new Error(`Task ${id} not found`);
    }
   tB3R����