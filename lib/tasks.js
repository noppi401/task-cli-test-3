import fs from 'fs/promises';
import path from 'path';

const TASKS_FILE = './tasks.json';

export class TaskManager {
  async loadTasks() {
    try {
      const data = await fs.readFile(TASKS_FILE, 'utf-8');
      const parsed = JSON.parse(data);
      return parsed.tasks || [];
    } catch (error) {
      if (error.code === 'ENOENT') {
        return [];
      }
      throw new Error(`Failed to load tasks: ${error.message}`);
    }
  }

  async saveTasks(tasks) {
    try {
      const data = JSON.stringify({ tasks }, null, 2);
      await fs.writeFile(TASKS_FILE, data, 'utf-8');
    } catch (error) {
      throw new Error(`Failed to save tasks: ${error.message}`);
    }
  }

  async addTask(title) {
    if (!title || title.trim() === '') {
      throw new Error('Task title cannot be empty');
    }

    const tasks = await this.loadTasks();
    const id = tasks.length > 0 ? Math.max(...tasks.map(t => t.id)) + 1 : 1;
    
    const newTask = {
      id,
      title: title.trim(),
      status: 'pending',
      createdAt: new Date().toISOString()
    };

    tasks.push(newTask);
    await this.saveTasks(tasks);
    
    return newTask;
  }
  
  Aasync listTasks(filter = 'all') {
    const tasks = await this.loadTasks();
    
    if (filter === 'pending') {
      return tasks.filter(t => t.status === 'pending');
    } else if (filter === 'completed') {
      return tasks.filter(t => t.status === 'completed');
    }
    
    return tasks;
  }

  async completeTask(taskId) {
    const tasks = await this.loadTasks();
    const task = tasks.find(t => t.id === parseInt(taskId));
    
    if (!task) {
      throw new Error(`Task ${taskId} not found`);
    }
  
  task.status = 'completed';
    task.completedAt = new Date().toISOString();
    
    await this.saveTasks(tasks);
    return task;
  }

  async deleteTask(taskId) {
    const tasks = await this.loadTasks();
    const index = tasks.findIndex(t => t.id === parseInt(taskId));
    
    if (index === -1) {
      throw new Error(`Task ${taskId} not found`);
    }

    const [deletedTask] = tasks.splice(index, 1);
    await this.saveTasks(tasks);
    
    return deletedTask;
  }
}


export const taskManager = new TaskManager();