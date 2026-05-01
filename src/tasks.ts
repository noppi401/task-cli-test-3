import fs from 'fs/promises';
import path from 'path';
import { Task, TaskStore, FilterType } from './types.js';

const TASKS_FILE = './tasks.json';

export class TaskManager {
  private tasks: Task[] = [];
  private nextId: number = 1;

  async load(): Promise<void> {
    try {
      const data = await fs.readFile(TASKS_FILE, 'utf-8');
      const store: TaskStore = JSON.parse(data);
      this.tasks = store.tasks;
      this.nextId = Math.max(...this.tasks.map(t => t.id), 0) + 1;
    } catch {
      this.tasks = [];
      this.nextId = 1;
    }
  }

  async save(): Promise<void> {
    const store: TaskStore = { tasks: this.tasks };
    await fs.writeFile(TASKS_FILE, JSON.stringify(store, null, 2));
  }

  addTask(title: string): Task {
    const task: Task = {
      id: this.nextId++,
      title,
      status: 'pending',
      createdAt: new Date().toISOString()
    };
    this.tasks.push(task);
    return task;
  }

  getTasks(filter: FilterType = 'all'): Task[] {
    if (filter === 'all') return this.tasks;
    return this.tasks.filter(t => t.status === filter);
  }

  completeTask(id: number): Task | null {
    const task = this.tasks.find(t => t.id === id);
    if (task) {
      task.status = 'completed';
    }
    return task || null;
  }

  deleteTask(id: number): boolean {
    const index = this.tasks.findIndex(t => t.id === id);
    if (index >= 0) {
      this.tasks.splice(index, 1);
      return true;
    }
    return false;
  }
}