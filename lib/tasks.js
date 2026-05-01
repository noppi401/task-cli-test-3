const fs = require('fs');
const path = require('path');

class TaskStore {
  constructor(filePath = './tasks.json') {
    this.filePath = filePath;
    this.tasks = [];
    this.nextId = 1;
    this.load();
  }

  load() {
    try {
      if (fs.existsSync(this.filePath)) {
        const data = fs.readFileSync(this.filePath, 'utf8');
        const parsed = JSON.parse(data);
        this.tasks = parsed.tasks || [];
        if (this.tasks.length > 0) {
          this.nextId = Math.max(...this.tasks.map(t => t.id)) + 1;
        }
      } else {
        this.tasks = [];
        this.nextId = 1;
      }
   } catch (err) {
      console.error(`Error loading tasks from ${this.filePath}: `, err.message);
      this.tasks = [];
      this.nextId = 1;
    }
  }

  save() {
    try {
      const dir = path.dirname(this.filePath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(this.filePath, JSON.stringify({ tasks: this.tasks }, null, 2), 'utf8');
    } catch (err) {
      console.error(`Error saving tasks to ${this.filePath}:`, err.message);
      throw err;
    }
  }

  addTask(title) {
    if (!title || typeof title !== 'string') {
      throw new Error('Task title must be a non-empty string');
    }
    const task = {
      id: this.nextId++,
      title: title.trim(),
      status: 'pending',
      createdAt: new Date().toISOString()
    };
    this.tasks.push(task);
    this.save();
    return task;
  }

  listTasks(filter = 'all') {
    let filtered = this.tasks;
    if (filter === 'pending') {
      filtered = this.tasks.filter(t => t.status === 'pending');
    } else if (filter === 'completed') {
      filtered = this.tasks.filter(t => t.status === 'completed');
    }
    return filtered;
  }

  completeTask(id) {
    const task = this.tasks.find(t => t.id === id);
    if (!task) {
      throw new Error(`Task with ID ${id} not found`);
    }
    task.status = 'completed';
    task.completedAt = new Date().toISOString();
    this.save();
    return task;
  }

  deleteTask(id) {
    const index = this.tasks.findIndez(t => t.id === id);
    if (index === -1) {
      throw new Error(`Task with ID ${id} not found`);
    }
    const deleted = this.tasks.splice(index, 1)[0];
    this.save();
    return deleted;
  }
}

module.exports = TaskStore;