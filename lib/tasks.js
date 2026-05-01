const fs=require('fs');
const path=require('path');

const TASKS_FILE=process.env.TASKS_FILE || path.join(process.cwd(), 'tasks.json');

function loadTasks() {
  try {
    if (!fs.existsSync(TASKS_FILE)) {
      return { tasks: [] };
    }
    const data=fs.readFileSync(TASKS_FILE, 'utf8');
    if (!data.trim()) {
      return { tasks: [] };
    }
    const parsed=JSON.parse(data);
    if (!parsed || !Array.isArray(parsed.tasks)) {
      return { tasks: [] };
    }
    return parsed;
  } catch (error) {
    console.error('Error reading tasks file:', error.message);
    return { tasks: [] };
  }
}

function saveTasks(data) {
  try {
    fs.writeFileSync(TASKS_FILE, JSON.stringify(data, null, 2), 'utf8');
  } catch (error) {
    throw new Error('Failed to save tasks: ' + error.message);
  }
}

function getNextId(tasks) {
  if (tasks.length===0) return 1;
  return Math.max(...tasks.map(t => t.id)) + 1;
}

function addTask(title) {
  if (!title || title.trim().length===0) {
    throw new Error('Task title cannot be empty');
  }
  const data=loadTasks();
  const task={
    id:getNextId(data.tasks),
    title:title.trim(),
    status:'pending',
    createdAt:new Date().toISOString()
  };
  data.tasks.push(task);
  saveTasks(data);
  return task;
}

function listTasks(filter=null) {
  const data=loadTasks();
  let taskList=data.tasks;
  if (filter) {
    if (filter!=='pending' && filter!=='completed') {
      throw new Error('Invalid filter: ' + filter + ". Use 'pending' or 'completed'.");
    }
    taskList=taskList.filter(t => t.status===filter);
  }
  return taskList;
}

function completeTask(taskId) {
  const data=loadTasks();
  const task=data.tasks.find(t => t.id===taskId);
  if (!task) {
    throw new Error('Task with ID  ' + taskId + ' not found');
  }
  task.status='completed';
  task.completedAt=new Date().toISOString();
  saveTasks(data);
  return task;
}

function deleteTask(taskId) {
  const data=loadTasks();
  const taskIndex=data.tasks.findIndex(t => t.id===taskId);
  if (taskIndex===-1) {
    throw new Error('Task with ID ' + taskId + ' not found');
  }
  const deletedTask=data.tasks[taskIndex];
  data.tasks.splice(taskIndex, 1);
  saveTasks(data);
  return deletedTask;
}

function getTaskById(taskId) {
  const data=loadTasks();
  const task=data.tasks.find(t => t.id===taskId);
  if (!task) {
    throw new Error('Task with ID ' + taskId + ' not found');
  }
  return task;
}

module.exports={
  loadTasks,
  saveTasks,
  addTask,
  listTasks,
  completeTask,
  deleteTask,
  getTaskById
};
