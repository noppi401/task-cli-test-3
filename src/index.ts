#!/usr/bin/env node
import fs from 'fs';
import path from 'path';

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

type TaskFilter = 'pending' | 'completed';

const TASKS_FILE = path.join(process.cwd(), 'tasks.json');

function exitWithError(message: string, error?: unknown): never {
  if (error instanceof Error) {
    console.error(`${message}: ${error.message}`);
  } else if (error !== undefined) {
    console.error(`${message}: ${String(error)}`);
  } else {
    console.error(message);
  }
  process.exit(1);
}

function validateTasksFile(data: unknown): TasksFile {
  if (!data || typeof data !== 'object' || !Array.isArray((data as TasksFile).tasks)) {
    exitWithError('Error reading tasks file: invalid tasks file format');
  }

  return data as TasksFile;
}

function loadTasks(): TasksFile {
  if (!fs.existsSync(TASKS_FILE)) {
    return { tasks: [] };
  }

  try {
    const fileContents = fs.readFileSync(TASKS_FILE, 'utf-8');
    return validateTasksFile(JSON.parse(fileContents));
  } catch (error) {
    exitWithError('Error reading tasks file', error);
  }
}

function saveTasks(data: TasksFile): void {
  try {
    fs.writeFileSync(TASKS_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (error) {
    exitWithError('Error saving tasks file', error);
  }
}

function getNextId(tasks: Task[]): number {
  if (tasks.length === 0) return 1;
  return Math.max(...tasks.map(t => t.id)) + 1;
}

function addTask(title: string): void {
  const trimmedTitle = title.trim();

  if (!trimmedTitle) {
    exitWithError('Error: Task title cannot be empty');
  }

  const data = loadTasks();
  const newTask: Task = {
    id: getNextId(data.tasks),
    title: trimmedTitle,
    status: 'pending',
    createdAt: new Date().toISOString(),
  };
  data.tasks.push(newTask);
  saveTasks(data);
  console.log(`Task added (ID: ${newTask.id})`);
}

function listTasks(filter?: TaskFilter): void {
  const data = loadTasks();
  let tasks = data.tasks;

  if (filter) {
    tasks = tasks.filter(t => t.status === filter);
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

function parseTaskId(value: string | undefined): number {
  if (!value) {
    exitWithError('Error: Task ID is required');
  }

  const id = Number(value);
  if (!Number.isInteger(id) || id <= 0) {
    exitWithError('Error: Task ID must be a positive integer');
  }

  return id;
}

function parseListFilter(args: string[]): TaskFilter | undefined {
  if (args.length === 0) {
    return undefined;
  }

  if (args.length === 1) {
    if (args[0] === '--pending') return 'pending';
    if (args[0] === '--completed') return 'completed';
  }

  if (args.length === 2 && args[0] === '--filter') {
    if (args[1] === 'pending' || args[1] === 'completed') {
      return args[1];
    }
    exitWithError('Error: --filter must be either pending or completed');
  }

  exitWithError('Error: Invalid list options. Use list, list --filter pending, list --filter completed, list --pending, or list --completed');
}

function completeTask(id: number): void {
  const data = loadTasks();
  const task = data.tasks.find(t => t.id === id);

  if (!task) {
    exitWithError(`Task ${id} not found.`);
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
    exitWithError(`Task ${id} not found.`);
  }

  data.tasks.splice(index, 1);
  saveTasks(data);
  console.log(`Task ${id} deleted`);
}

function showHelp(): void {
  console.log(`
Task Management CLI

Usage:
  node index.js <command> [options]

Commands:
  add <title>                    Add a new task
  list                           List all tasks
  list --filter <status>         List tasks by status (pending, completed)
  list --pending                 List pending tasks
  list --completed               List completed tasks
  complete <id>                  Mark task as complete
  delete <id>                    Delete a task
  help                           Show this help message

Examples:
  node index.js add "Buy groceries"
  node index.js list
  node index.js list --filter pending
  node index.js list --filter completed
  node index.js complete 1
  node index.js delete 1
  `);
}

function main(): void {
  const args = process.argv.slice(2);

  if (args.length === 0 || args[0] === 'help' || args[0] === '--help' || args[0] === '-h') {
    showHelp();
    return;
  }

  const command = args[0];

  switch (command) {
    case 'add':
      if (args.length < 2) {
        exitWithError('Error: Task title is required');
      }
      addTask(args.slice(1).join(' '));
      break;

    case 'list':
      listTasks(parseListFilter(args.slice(1)));
      break;

    case 'complete':
      completeTask(parseTaskId(args[1]));
      break;

    case 'delete':
      deleteTask(parseTaskId(args[1]));
      break;

    default:
      console.error(`Unknown command: ${command}`);
      showHelp();
      process.exit(1);
  }
}

main();
