const fs = require('fs');
const path = require('path');
const pathToFile = path.join(process.cwd(), 'tasks.json');

function loadTasks() {
  try {
    if (fs.existsSync(pathToFile)) {
      const data = fs.readFileSync(pathToFile, 'utf-8');
      return JSON.parse(data).tasks || [];
    }
  } catch (err) {
    console.error('Failed to load tasks', err.message);
  }
  return [];
}

function saveTasks(tasks) {
  try {
    const data = { tasks };
    fs.writeFileSync(pathToFile, JSON.stringify(data, null, 2), 'utf-8');
    return true;
  } catch (err) {
    console.error('Failed to save tasks', err.message);
    return false;
  }
}

function addTask(title) {
  const tasks = loadTasks();
  const newId = tasks.length ? Math.max(...tasks.map(t => t.id)) + 1 : 1;
  const newTask = {
    id: newId,
    title,
    status: 'pending',
    createdAt: new Date().toISOString()
  };
  tasks.push(newTask);
  saveTasks(tasks);
  return newTask;
}

function listTasks(filter = null) {
  const tasks = loadTasks();
  if (filter === 'pending') {
    return tasks.filter(t => t.status === 'pending');
  } else if (filter === 'completed') {
    return tasks.filter(t => t.status === 'completed');
  }
  return tasks;
}

function getTaskById(id) {
  const tasks = loadTasks();
  return tasks.find(t => t.id === id);
}

function completeTask(id) {
  const tasks = loadTasks();
  const taskIndex = tasks.findIndex(t => t.id === id);
  if (taskIndex === -1) {
    return false;
  }
  tasks[taskIndex].status = 'completed';
  tasks[taskIndex].completedAt = new Date().toISOString();
  saveTasks(tasks);
  return true;
}

function deleteTask(id) {
  const tasks = loadTasks();
  const taskIndex = tasks.findIndex(t => t.id === id);
  if (taskIndex === -1) {
    return false;
  }
  tasks.splice(taskIndex, 1);
  saveTasks(tasks);
  return true;
}

module.exports = {
  addTask,
  listTasks,
  getTaskById,
  completeTask,
  deleteTask
};
