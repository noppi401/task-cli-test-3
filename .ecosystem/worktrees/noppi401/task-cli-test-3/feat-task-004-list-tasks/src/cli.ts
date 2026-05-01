import { readFileSync, writeFileSync, existsSync } from 'fs';
import { resolve } from 'path';

interface Task {
  id: number;
  title: string;
  status: 'pending' | 'completed';
  createdAt: string;
}

interface TaskData {
  tasks: Task[];
}

const TASKS_FILE = resolve('./tasks.json');

function loadTasks(): TaskData {
  if (!existsSync(TASKS_FILE)) {
    return { tasks: [] };
  }
  try {
    const data = readFileSync(TASKS_FILE, 'utf-8');
    return JSON.parse(data);
  } catch {
    return { tasks: [] };
  }
}

function saveTasks(data: TaskData): void {
  writeFileSync(TASKS_FILE, JSON.stringify(data, null, 2));
}

function getNextId(tasks: Task[]): number {
  if (tasks.length === 0) return 1;
  return Math.max(...tasks.map(t => t.id)) + 1;
}

function addTask(title: string): void {
  const data = loadTasks();
  const id = getNextId(data.tasks);
  const task: Task = {
    id,
    title,
    status: 'pending',
    createdAt: new Date().toISOString()
  };
  data.tasks.push(task);
  saveTasks(data);
  console.log(`Task added (ID: ${id})`);
}

function listTasks(filter?: 'all' | 'pending' | 'completed'): void {
  const data = loadTasks();
  let tasks = data.tasks;

  if (filter === 'pending') {
    tasks = tasks.filter(t => t.status === 'pending');
  } else if (filter === 'completed') {
    tasks = tasks.filter(t => t.status === 'completed');
  }

  if (tasks.length === 0) {
    console.log('No tasks found.');
    return;
  }

  console.log('\\nID  Title        Status');
  console.log('--  -----      ------');
  tasks.forEach(task => {
    const title = task.title.substring(0, 16).padEnd(16);
    console.log(`${task.id}   ${title}  ${task.status}`);
  });
  console.log();
}

function completeTask(id: number): void {
  const data = loadTasks();
  const task = data.tasks.find(t => t.id === id);
  if (!task) {
    console.error(`Task ${id} not found.`);
    return;
  }
  task.status = 'completed';
  saveTasks(data);
  console.log(`Task ${id} marked as complete`);
}

function deleteTask(id: number): void {
  const data = loadTasks();
  const index = data.tasks.findIndex(t => t.id === id);
  if (index === -1) {
    console.error(`Task ${id} not found.`);
    return;
  }
  data.tasks.splice(index, 1);
  saveTasks(data);
  console.log(`Task ${id} deleted`);
}

function main(): void {
  const args = process.argv.slice(2);
  const command = args[0];

  if (!command) {
    console.log('Usage: node index.js <command> [args]');
    console.log('Commands:');
    console.log('  add <title>    - Add a new task');
    console.log('  list [filter]  - List tasks (all, pending, completed)');
    console.log('  complete <id>  - Mark task as complete');
    console.log('  delete <id>    - Delete a task');
    return;
  }

  switch (command) {
    case 'add':
      if (!args[1]) {
        console.error('Task title required');
        return;
      }
      addTask(args[1]);
      break;
    case 'list':
      listTasks(args[1] as 'all' | 'pending' | 'completed');
      break;
    case 'complete':
      if (!args[1]) {
        console.error('Task ID required');
        return;
      }
      completeTask(parseInt(args[1], 10));
      break;
    case 'delete':
      if (!args[1]) {
        console.error('Task ID required');
        return;
      }
      deleteTask(parseInt(args[1], 10));
      break;
    default:
      console.error(`Unknown command: ${command}`);
  }
}

main();