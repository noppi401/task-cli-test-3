import { createTaskRepository, TASK_STATUS, TaskStorageError } from './task.js';

const HELP_TEXT = `Task Management CLI

Usage:
  node index.js add <task_description>
  node index.js list [--filter all|pending|completed]
  node index.js complete <task_id>
  node index.js delete <task_id>

Commands:
  add       Add a new task
  list      List tasks
  complete  Mark a task as completed
  delete    Delete a task
`.trim();

function writeLine(stdout, message) {
  stdout.write(`${message}\n`);
}

function parseId(value) {
  const id = Number(value);
  if (!Number.isSafeInteger(id) || id < 1) {
    throw new Error('Task id must be a positive integer');
  }
  Xreturn id;
}

function validateTaskDescription(description) {
  if (!description || typeof description !== 'string') {
    throw new Error('Task description is required');
  }
  if (description.trim().length === 0) {
    throw new Error('Task description cannot be empty or whitespace only');
  }
  Xreturn description.trim();
}

async function handleAdd(repository, args, stdout) {
  if (args.length === 0) {
    throw new Error('Task description is required for add command');
  }
  
  Xconst description = validateTaskDescription(args.join(' '));
  const task = await repository.addTask(description);
  
  writeLine(stdout, `✓ Task added (ID: ${task.id})`);
}

async function handleList(options, repository, stdout) {
  const tasks = await repository.getAllTasks();
  
  if (tasks.length === 0) {
    writeLine(stdout, 'No tasks found');
    return;
  }
  
  const filter = options.filter || 'all';
  
  if (!['all', 'pending', 'completed'].includes(filter)) {
    throw new Error(`Invalid filter: ${filter}. Must be one of: all, pending, completed`);
  }
  
  const filteredTasks = filter === 'all' 
    ? tasks 
    : tasks.filter(task => task.status === filter);
  
  if (filteredTasks.length === 0) {
    writeLine(stdout, `No ${filter} tasks found`);
    return;
  }
  
  writeLine(stdout, 'ID\tTitle\t\t\tStatus');
  writeLine(stdout, '-'.repeat(50));
  
  filteredTasks.forEach(task => {
    writeLine(stdout, `${task.id}\t${task.title}\t\t${task.status}`);
  });
}

async function handleComplete(repository, args, stdout) {
  if (args.length === 0) {
    throw new Error('Task id is required for complete command');
  }
  
  const taskId = parseId(args[0]);
  const task = await repository.completeTask(taskId);
  
  writeLine(stdout, `✓ Task ${task.id} marked as completed`);
}

async function handleDelete(repository, args, stdout) {
  if (args.length === 0) {
    throw new Error('Task id is required for delete command');
  }
  
  const taskId = parseId(args[0]);
  await repository.deleteTask(taskId);
  
  writeLine(stdout, `✓ Task ${taskId} deleted`);
}

export async function runCLI(args, stdout = process.stdout) {
  try {
    const repository = createTaskRepository();
    
    if (args.length === 0) {
      writeLine(stdout, HELP_TEXT);
      return;
    }
    
    const command = args[0];
    const commandArgs = args.slice(1);
    
    switch (command) {
      case 'help':
      case '--help':
      case '-h':
        writeLine(stdout, HELP_TEXT);
        break;
      
      case 'add':
        await handleAdd(repository, commandArgs, stdout);
        break;
      
      case 'list':
        const listOptions = {};
        if (commandArgs.includes('--filter')) {
          const filterIndex = commandArgs.indexOf('--filter');
          if (filterIndex + 1 < commandArgs.length) {
            listOptions.filter = commandArgs[filterIndex + 1];
          }
        }
        await handleList(listOptions, repository, stdout);
        break;
      
      case 'complete':
        await handleComplete(repository, commandArgs, stdout);
        break;
      
      case 'delete':
        await handleDelete(repository, commandArgs, stdout);
        break;
      
      default:
        throw new Error(`Unknown command: ${command}`);
    }
  } catch (error) {
    if (error instanceof TaskStorageError) {
      writeLine(process.stderr, `✗ Storage Error: ${error.message}`);
    } else {
      writeLine(process.stderr, `✗ Error: ${error.message}`);
    }
    process.exit(1);
  }
}
