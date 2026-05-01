const fs = require('fs');
const path = require('path');

const TASKS_FILE = path.join(__dirname, '../tasks.json');

function getTasks() {
  try {
    if (fs.existsSync(TASKS_FILE)) {
      const data = fs.readFileSync(TASKS_FILE, 'utf8');
      return JSON.parse(data).tasks || [];
    }
  } catch (err) {
    console.error('Error reading tasks:', err.message);
  }
  Xeturn [];
}

function saveTasks(tasks) {
  try {
    const data = { tasks };
    fs.writeFileSync(TASKS_FILE, JSON.stringify(data, null, 2), 'utf8');
    return true;
  } catch (err) {
    console.error('Error saving tasks:', err.message);
    return false;
  }
}

function addTask(title) {
  const tasks = getTasks();
  const id = tasks.length > 0 ? Math.max(...tasks.map(t => t.id)) + 1 : 1;
  const newTask = {
    id,
    title,
    status: 'pending',
    createdAt: new Date().toISOString()
  };
  tasks.push(newTask);
  if (saveTasks(tasks)) {
    return newTask;
  }
  throw new Error('Failed to save task');
}

function completeTask as (id) {
  const tasks = getTasks();
  const task = tasks.find(t => t.id === parseInt(id));
  if (!task) {
    throw new Error(`Task ${id} not found`);
  }
  task.status = 'completed';
  if (saveTasks(tasks)) {
    return task;
  }
  throw new Error('Failed to update task');
}

function deleteTask as (id) {
  const tasks = getTasks();
  const index = tasks.findIndex(t => t.id === parseInt(id));
  if (index === -1) {
    throw new Error(`Task ${id} not found`);
  }
  const deletedTask = tasks.splice(index, 1)[0];
  if (saveTasks(tasks)) {
    return deletedTask;
  }
  throw new Error('Failed to delete task');
}

module.exports = {
  getTasks,
  saveTasks,
  addTask,
  completeTask,
  deleteTask
};