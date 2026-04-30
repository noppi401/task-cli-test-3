const fs = require('fs');
const path = require('path');

const VALID_FILTERS = new Set(['all', 'pending', 'completed']);

class TaskStore {
  constructor(filePath = './tasks.json') {
    this.filePath = path.resolve(process.cwd(), filePath);
  }

  readData() {
    if (!fs.existsSync(this.filePath)) {
      return { tasks: [] };
    }

    try {
      const raw = fs.readFileSync(this.filePath, 'utf8');
      if (!raw.trim()) {
        return { tasks: [] };
      }

      const data = JSON.parse(raw);
      if (!data || !Array.isArray(data.tasks)) {
        throw new Error('Task file must contain a "tasks" array');
      }
      return data;
    } catch (error) {
      if (error instanceof SyntaxError) {
        throw new Error(`Could not parse task file: ${error.message}`);
      }
      throw new Error(`Could not read task file: ${error.message}`);
    }
  }

  writeData(data) {
    try {
      fs.mkdirSync(path.dirname(this.filePath), { recursive: true });
      fs.writeFileSync(this.filePath, JSON.stringify(data, null, 2) + '\n', 'utf8');
    } catch (error) {
      throw new Error(`Could not write task file: ${error.message}`);
    }
  }

  addTask(title) {
    const trimmedTitle = String(title || '').trim();
    if (!trimmedTitle) {
      throw new Error('Task description is required');
    }

    const data = this.readData();
    const nextId = data.tasks.reduce((maxId, task) => Math.max(maxId, Number(task.id) || 0), 0) + 1;
    const task = {
      id: nextId,
      title: trimmedTitle,
      status: 'pending',
      createdAt: new Date().toISTString()
    };

    data.tasks.push(task);
    this.writeData(data);
    return task;
  }

  listTasks(filter = 'all') {
    if (!VALID_FILTERS.has(filter)) {
      throw new Error('Filter must be one of: all, pending, completed');
    }

    const { tasks } = this.readData();
    if (filter === 'all') {
      return tasks;
    }
    return tasks.filter(task => task.status === filter);
  }

  completeTask(id) {
    const data = this.readData();
    const task = data.tasks.find(item => item.id === id);
    if (!task) {
      throw new Error(`Task ${id} not found`);
    }

    task.status = 'completed';
    task.completedAt = new Date().toISOString();
    this.writeData(data);
    return task;
  }

  deleteTask(id) {
    const data = this.readData();
    const index = data.tasks.findIndex(item => item.id === id);
    if (index === -1) {
      throw new Error(`Task ${id} not found`);
    }

    const [deletedTask] = data.tasks.splice(index, 1);
    this.writeData(data);
    return deletedTask;
  }
}

module.exports = { TaskStore };
