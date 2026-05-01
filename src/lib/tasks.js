import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const TASKS_FILE = path.join(process.cwd(), "tasks.json");

// Load tasks from file
function loadTasks() {
  try {
    if (fs.existsSync(TASKS_FILE)) {
      const data = fs.readFileSync(TASKS_FILE, "utf-8");
      return JSON.parse(data);
    }
    return { tasks: [] };
  } catch (error) {
    console.error("Error loading tasks:", error.message);
    return { tasks: [] };
  }
}

// Save tasks to file
function saveTasks(data) {
  try {
    fs.writeFileSync(TASKS_FILE, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error("Error saving tasks:", error.message);
    throw error;
  }
}

// Add a new task
function addTask(title) {
  if (!title || title.trim() === "") {
    throw new Error("Task title cannot be empty");
  }

  const data = loadTasks();
  const id = data.tasks.length > 0 ? Math.max(...data.tasks.map(t => t.id)) + 1 : 1;

  const newTask = {
    id,
    title: title.trim(),
    status: "pending",
    createdAt: new Date().toISOString()
  };

  data.tasks.push(newTask);
  saveTasks(data);

  return newTask;
}

// List tasks with optional filter
function listTasks(filter = "all") {
  const data = loadTasks();
  let tasks = data.tasks;

  if (filter === "pending") {
    tasks = tasks.filter(t => t.status === "pending");
  } else if (filter === "completed") {
    tasks = tasks.filter(t => t.status === "completed");
  }

  return tasks;
}

// Mark task as complete
function completeTask(taskId) {
  const data = loadTasks();
  const task = data.tasks.find(t => t.id === parseInt(taskId));

  if (!task) {
    throw new Error(`Task with ID ${taskId} not found`);
  }

  task.status = "completed";
  task.completedAt = new Date().toISOString();
  saveTasks(data);

  return task;
}

// Delete a task
function deleteTask(taskId) {
  const data = loadTasks();
  const taskIndex = data.tasks.findIndex(t => t.id === parseInt(taskId));

  if (taskIndex === -1) {
    throw new Error(`Task with ID ${taskId} not found`);
  }

  const deletedTask = data.tasks[taskIndex];
  data.tasks.splice(taskIndex, 1);
  saveTasks(data);

  return deletedTask;
}

export {
  loadTasks,
  saveTasks,
  addTask,
  listTasks,
  completeTask,
  deleteTask
};
