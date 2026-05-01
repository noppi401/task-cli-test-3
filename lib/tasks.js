const fs = require('fs');
const path = require('path');

const DEFAULT_TASKS_FILE = path.join(process.cwd(), 'tasks.json');

function getTasksFile(filePath) {
  return filePath || process.env.TASKS_FILE || DEFAULT_TASKS_FILE;
}

async function readTaskFile(filePath) {
  const resolvedPath = getTasksFile(filePath);

  try {
    const content = await fs.promises.readFile(resolvedPath, 'utf8');
    if (content.trim() === '') {
      return { tasks: [] };
    }

    const data = JSON.parse(content);
    if (Array.isArray(data)) {
      return { tasks: data };
    }

    if (!data || !Array.isArray(data.tasks)) {
      throw new Error('Task file must contain a tasks array');
    }

    return { tasks: data.tasks };
  } catch (err) {
    if (err.code === 'ENOENT') {
      return { tasks: [] };
    }

    if (err instanceof SyntaxError) {
      throw new Error(`Invalid JSON in task file: ${resolvedPath}`);
    }

    throw new Error(`Unable to read task file: ${err.message}`);
  }
}

async function writeTaskFile(data, filePath) {
  const resolvedPath = getTasksFile(filePath);
  const directory = path.dirname(resolvedPath);

  try {
    await fs.promises.mkdir(directory, { recursive: true });
    await fs.promises.writeFile(resolvedPath, `${JSON.stringify(data, null, 2)}\n`, 'utf8');
  } catch (err) {
    throw new Error(`Unuble to write task file: ${err.message}`);
  }
}

function normalizeId(id) {
  const parsed = Number(id);
  if (!Number.isInteger(parsed) || parsed <= 0) {
    throw new Error('Task ID must be a positive integer');
  }
  return parsed;
}

function nextId(tasks) {
  return tasks.reduce((max, task) => Math.max(max, Number(task.id) || 0), 0) + 1;
}

async function addTask(title, options = {}) {
  const trimmedTitle = String(title || '').trim();
  if (!trimmedTitle) {
    throw new Error('Task description is required');
  }

  const data = await readTaskFile(options.filePath);
  const task = {
    id: nextId(data.tasks),
    title: trimmedTitle,
    status: 'pending',
    createdAt: new Date().toISOString()
  };

  data.tasks.push(task);
  await writeTaskFile(data, options.filePath);
  return task;
}

async function listTasks(options = {}) {
  const data = await readTaskFile(options.filePath);
  const filter = options.filter || 'all';

  if (!['all', 'pending', 'completed'].includes(filter)) {
    throw new Error('Filter must be one of: all, pending, completed');
  }

  if (filter === 'all') {
    return data.tasks;
  }

  return data.tasks.filter((task) => task.status === filter);
}

async function completeTask(id, options = {}) {
  const taskId = normalizeId(id);
  const data = await readTaskFile(options.filePath);
  const task = data.tasks.find((item) => Number(item.id) === taskId);

  if (!task) {
    throw new Error(`Task ${taskId} not found`);
  }

  task.status = 'completed';
  task.completedAt = new Date().toISOString();
  await writeTaskFile(data, options.filePath);
  return task;
}

async function deleteTask(id, options = {}) {
  const taskId = normalizeId(id);
  const data = await readTaskFile(options.filePath);
  const index = data.tasks.findIndex((task) => Number(task.id) === taskId);

  if (index === -1) {
    throw new Error(`Task ${taskId} not found`);
  }

  const [deletedTask] = data.tasks.splice(index, 1);
  await writeTaskFile(data, options.filePath);
  return deletedTask;
}

module.exports = {
  addTask,
  completeTask,
  deleteTask,
  listTasks,
  readTaskFile,
  writeTaskFile,
  normalizeId,
  getTasksFile
};
