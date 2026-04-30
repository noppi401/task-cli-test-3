const fs = require('fs');
const path = require('path');

const DEFAULT_TASK_FILE = path.resolve(process.cwd(), 'tasks.json');

class TaskStoreError extends Error {
  constructor(message) {
    super(message);
    this.name = 'TaskStoreError';
  }
}

function getTaskFile(options = {}) {
  return path.resolve(options.taskFile || process.env.TASK_FILE || DEFAULT_TASK_FILE);
}

function normalizeStore(data) {
  if (Array.isArray(data)) {
    return { tasks: data };
  }

  if (!data || !Array.isArray(data.tasks)) {
    throw new TaskStoreError('Task file must contain a tasks array.');
  }

  return data;
}

function readStore(options = {}) {
  const taskFile = getTaskFile(options);

  if (!fs.existsSync(taskFile)) {
    return { tasks: [] };
  }

  try {
    const raw = fs.readFileSync(taskFile, 'utf8');
    if (!raw.trim()) {
      return { tasks: [] };
    }
    return normalizeStore(JSON.parse(raw));
  } catch (err) {
    if (err instanceof SyntaxError) {
      throw new TaskStoreError(`Failed to parse task file: ${taskFile}`);
    }
    throw new TaskStoreError(`Failed to read task file: ${err.message}`);
  }
}

function writeStore(store, options = {}) {
  const taskFile = getTaskFile(options);

  try {
    fs.mkdirSync(path.dirname(taskFile), { recursive: true });
    fs.writeFileSync(taskFile, `${JSON.stringify(store, null, 2)}\n`, 'utf8');
  } catch (err) {
    throw new TaskStoreError(`Failed to write task file: ${err.message}`);
  }
}

function nextId(tasks) {
  return tasks.reduce((max, task) => Math.max(max, Number(task.id) || 0), 0) + 1;
}

function addTask(title, options = {}) {
  const store = readStore(options);
  const task = {
    id: nextId(store.tasks),
    title,
    status: 'pending',
    createdAt: new Date().toISOString(),
  };
  store.tasks.push(task);
  writeStore(store, options);
  return task;
}

function listTasks(filter = 'all', options = {}) {
  const store = readStore(options);
  return filter === 'all' ? store.tasks : store.tasks.filter(task => task.status === filter);
}

function completeTask(id, options = {}) {
  const store = readStore(options);
  const task = store.tasks.find(item => item.id === id);
  if (!task) {
    throw new TaskStoreError(`Task ${id} not found.`);
  }
  task.status = 'completed';
  task.completedAt = new Date().toISOString();
  writeStore(store, options);
  return task;
}

function deleteTask(id, options = {}) {
  const store = readStore(options);
  const index = store.tasks.findIndex(task => task.id === id);
  if (index === -1) {
    throw new TaskStoreError(`Task ${id} not found.`);
  }
  const [deletedTask] = store.tasks.splice(index, 1);
  writeStore(store, options);
  return deletedTask;
}

module.exports = { TaskStoreError, addTask, completeTask, deleteTask, getTaskFile, listTasks, readStore, writeStore };
