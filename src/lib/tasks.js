import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const TASKS_FILE = path.join(__dirname, '../../tasks.json');

export async function addTask(title) {
  const tasks = await loadTasks();
  const newId = tasks.length > 0 ? Math.max(...tasks.map(t => t.id)) + 1 : 1;
  const newTask = {
    id: newId,
    title: title,
    status: 'pending',
    createdAt: new Date().toISOString()
  };
  tasks.push(newTask);
  await saveTasks(tasks);
  return newTask;
}

export async function listTasks(filter) {
  const tasks = await loadTasks();
  if (!filter) {
    return tasks;
  }
  return tasks.filter(t => t.status === filter);
}

export async function completeTask(taskId) {
  const tasks = await loadTasks();
  const task = tasks.find(t => t.id === taskId);
  if (!task) {
    throw new Error(`Task ${taskId} not found`);
  }
  task.status = 'completed';
  task.completedAt = new Date().toISOString();
  await saveTasks(tasks);
}

export async function deleteTask(taskId) {
  const tasks = await loadTasks();
  const index = tasks.findIndex(t => t.id === taskId);
  if (index === -1) {
    throw new Error(`Task ${taskId} not found`);
  }
  tasks.splice(index, 1);
  await saveTasks(tasks);
}

async function loadTasks() {
  try {
    const data = await fs.readFile(TASKS_FILE, 'utf-8');
    const json = JSON.parse(data);
    return Array.isArray(json) ? json : json.tasks || [];
  } catch (error) {
    if (error.code === 'ENOENT') {
      return [];
    }
    throw error;
  }
}

async function saveTasks(tasks) {
  await fs.writeFile(TASKS_FILE, JSON.stringify(tasks, null, 2), 'utf-8');
}