#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

interface Task {
  id: number;
  title: string;
  status: 'pending' | 'completed';
  createdAt: string;
  completedAt?: string;
}

interface TasksFile {
  tasks: Task[];
}

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const TASKS_FILE = path.join(process.cwd(), 'tasks.json');

function loadTasks(): TasksFile {
  try {
    if (fs.existsSync(TASKS_FILE)) {
      const data = fs.readFileSync(TASKS_FILE, 'utf-8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('Error reading tasks file:', error);
  }
  return { tasks: [] };
}

function saveTasks(data: TasksFile): void {
  try {
    fs.writeFileSync(TASKS_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (error) {
    console.error('Error saving tasks file:', error);
    process.exit(1);
  }
}

function getNextId(tasks: Task[]): number {
  if (tasks.length === 0) return 1;
  return Math.max(...tasks.map(t => t.id)) + 1;
}

function addTask(title: string): void {
  const data = loadTasks();
  const newTask: Task = {
    id: getNextId(data.tasks),
    title,
    status: 'pending',
    createdAt: new Date().toISOString(),
  };
  data.tasks.push(newTask);
  saveTasks(data);
  console.log(`Task added (ID: ${newTask.id})`);
}

function listTasks(filter?: string): void {
  const data = loadTasks();
  let tasks = data.tasks;

  if (filter === '--pending') {
    tasks = tasks.filter(t => t.status === 'pending');
  } else if (filter === '--completed') {
    tasks = tasks.filter(t => t.status === 'completed');
  }

  if (tasks.length === 0) {
    console.log('No tasks found.');
    return;
  }

  console.log('ID\tTitle\t\t\tStatus\t\tCreated At');
  console.log('---\t---\t\t\t---\t\t---');
  tasks.forEach(task => {
    const createdDate = new Date(task.createdAt).toLocaleDateString();
    console.log(`${task.id}\t${task.title}\t\t${task.status}\t\t${createdDate}`);
  });
}

function completeTask(id: number): void {
  const data = loadTasks();
  const task = data.tasks.find(t => t.id === id);

  if (!task) {
    console.error(`Task ${id} not found.`);
    process.exit(1);
  }

  task.status = 'completed';
  task.completedAt = new Date().toISOString();
  saveTasks(data);
  console.log(`Task ${id} marked as complete`);
}

function deleteTask(id: number): void {
  const data = loadTasks();
  const index = data.tasks.findIndex(t => t.id === id);

  if (index === -1) {
    console.error(`Task ${id} not found.`);
    process.exit(1);
  }

  data.tasks.splice(index, 1);
  saveTasks(data);
  console.log(`Task ${id} deleted`);
}

function showHelp(): void {
  console.log(`
HTask Management CLI

Usage:
  node index.js <command> [options]

Commands:
  add <title>          Add a new task
  list [--filter]       List tasks (--pending, --completed)
  complete <id>         Mark task as complete
  delete <id>           Delete a task
  help                 Show this help message

Examples:
  node index.js add "Buy groceries"
  node index.js list
  node index.js list --pending
  node index.js complete 1
  node index.js delete 1
  `);
}

function main(): void {
  const args = process.argv.slice(2);

  if (args.length === 0 || args[0] === 'help') {
    showHelp();
    return;
  }

  const command = args[0];

  switch (command) {
    case 'add':
      if (args.length < 2) {
        console.error('Error: Task title is required');
        process.exit(1);
      }
      addTask(args.slice(1).join(' '));
      break;

    case 'list':
      listTasks(args[1]);
      break;

    case 'complete':
      if (args.length < 2) {
        console.error('Error: Task ID is required');
        process.exit(1);
      }
      completeTask(parseInt(args[1], 10));
      break;

    case 'delete':
      if (args.length < 2) {
        console.error('Error: Task ID is required');
        process.exit(1);
      }
      deleteTask(parseInt(args[1], 10));
      break;

    default:
      console.error(`Unknown command: ${command}`);
      showHelp();
      process.exit(1);
  }
}

main();