const fs = require('fs');
const path = require('path');

const DEFAULT_FILE = './tasks.json';

function resolveFile(file = DEFAULT_FILE) {
  return path.resolve(process.cwd(), file);
}

function readTasks(file = DEFAULT_FILE) {
  const storePath = resolveFile(file);

  if (!fs.existsSync(storePath)) {
    return [];
  }

  try {
    const raw = fs.readFileSync(storePath, 'utf8').trim();
    if (!raw) {
      return [];
    }

    const data = JSON.parse(raw);
    if (Array.isArray(data)) {
      return data;
    }

    return Array.isArray(data.tasks) ? data.tasks : [];
  } catch (error) {
    if (error instanceof SyntaxError) {
      throw new Error('Storage file contains invalid JSON.');
    }
    throw new Error('Unable to read storage file: ' + error.message);
  }
}

function writeTasks(tasks, file = DEFAULT_FILE) {
  const storePath = resolveFile(file);
  fs.mkdirSync(path.dirname(storePath), { recursive: true });

  try {
    fs.writeFileSync(storePath, JSON.stringify({ tasks }, null, 2) + '\n');
  } catch (error) {
    throw new Error('Unable to write storage file: ' + error.message);
  }
}

function nextId(tasks) {
  return tasks.reduce((max, task) => Math.max(max, Number(task.id) || 0), 0) + 1;
}

function addTask(title, file = DEFAULT_FILE) {
  const trimmedTitle = String(title || '').trim();
  if (!trimmedTitle) {
    throw new Error('Task description is required.');
  }

  const tasks = readTasks(file);
  const task = {
    id: nextId(tasks),
    title: trimmedTitle,
    status: 'pending',
    createdAt: new Date().toISOString()
  };

  tasks.push(task);
  writeTasks(tasks, file);
  return task;
}

function listTasks(filter = 'all', file = DEFAULT_FILE) {
  if (!['all', 'pending', 'completed'].includes(filter)) {
    throw new Error('Filter must be one of: all, pending, completed.');
  }

  const tasks = readTasks(file);
  return filter === 'all' ? tasks : tasks.filter((task) => task.status === filter);
}

function validateId(id) {
  const numericId = Number(id);
  if (!Number.isInteger(numericId) || numericId < 1) {
    throw new Error('Task id must be a positive integer.');
  }
  return numericId;
}

function completeTask(id, file = DEFAULT_FILE) {
  const numericId = validateId(id);
  const tasks = readTasks(file);
  const task = tasks.find((item) => Number(item.id) === numericId);

  if (!task) {
    throw new Error('Task ' + numericId + ' not found.');
  }

  task.status = 'completed';
  task.completedAt = new Date().toISOString();
  writeTasks(tasks, file);
  return task;
}

function deleteTask(id, file = DEFAULT_FILE) {
  const numericId = validateId(id);
  const tasks = readTasks(file);
  const task = tasks.find((item) => Number(item.id) === numericId);

  if (!task) {
    throw new Error('Task ' + numericId + ' not found.');
  }

  writeTasks(tasks.filter((item) => Number(item.id) !== numericId), file);
  return task;
}

module.exports = {
  addTask,
  completeTask,
  deleteTask,
  listTasks,
  readTasks,
  writeTasks
};
