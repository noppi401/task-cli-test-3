import fs from 'node:fs';
import path from 'node:path';

export class TaskManager {
  constructor(filePath = process.env.TASKS_FILE || path.resolve(process.cwd(), 'tasks.json')) {
    this.filePath = filePath;
  }

  load() {
    try {
      const data = JSON.parse(fs.readFileSync(this.filePath, 'utf8'));
      if (Array.isArray(data)) {
        return data;
      }
      return Array.isArray(data.tasks) ? data.tasks : [];
    } catch (error) {
      if (error.code === 'ENOENT') {
        return [];
      }
      throw new Error(`Failed to read tasks: ${error.message}`);
    }
  }

  save(tasks) {
    try {
      fs.mkdirSync(path.dirname(this.filePath), { recursive: true });
      fs.writeFileSync(this.filePath, JSON.stringify({ tasks }, null, 2) + '\n', 'utf8');
    } catch (error) {
      throw new Error(`Failed to write tasks: ${error.message}`);
    }
  }

  addTask(title) {
    const cleanTitle = String(title ?? '').trim();

    if (!cleanTitle) {
      throw new Error('Task description is required');
    }

    const tasks = this.load();
    const nextId = tasks.reduce((maxId, task) => Math.max(maxId, Number(task.id) || 0), 0) + 1;
    const task = {
      id: nextId,
      title: cleanTitle,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };

    tasks.push(task);
    this.save(tasks);
    return task;
  }

  listTasks(filter) {
    const tasks = this.load();
    return filter ? tasks.filter((task) => task.status === filter) : tasks;
  }

  completeTask(id) {
    const tasks = this.load();
    const task = tasks.find((item) => String(item.id) === String(id));

    if (!task) {
      throw new Error(`Task ${id} not found`);
    }

    task.status = 'completed';
    task.completedAt = new Date().toISOString();
    this.save(tasks);
    return task;
  }

  deleteTask(id) {
    const tasks = this.load();
    const nextTasks = tasks.filter((task) => String(task.id) !== String(id));

    if (nextTasks.length === tasks.length) {
      throw new Error(`Task ${id} not found`);
    }

    this.save(nextTasks);
  }
}

export function createTaskManager(filePath) {
  return new TaskManager(filePath);
}

export default createTaskManager();
