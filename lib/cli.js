const { addTask, listTasks, completeTask, deleteTask } = require('./tasks');

const HELP_TEXT = `Task CLI

Usage:
  task-cli [--file <path>] <command> [options]
  node index.js [--file <path>] <command> [options]

Commands:
  add <title>                Add a new pending task
  list [--filter <status>]   List tasks (status: all, pending, completed)
  complete <id>              Mark a task as completed
  delete <id>                Delete a task permanently
  help                      Show this help message

Global Options:
  --file <path>              JSON file to use for storage (default: ./tasks.json)
  -h, --help                 Show this help message

Examples:
  task-cli add "Buy groceries"
  task-cli list
  task-cli list --filter pending
  task-cli complete 1
  task-cli delete 1`;

function parseArgs(args) {
  const remaining = [];
  let file;

  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];

    if (arg === '--file') {
      const value = args[index + 1];
      if (!value) {
        throw new Error('Missing value for --file.');
      }
      file = value;
      index += 1;
      continue;
    }

    if (arg.startsWith('--file=')) {
      const value = arg.slice('--file='.length);
      if (!value) {
        throw new Error('Missing value for --file.');
      }
      file = value;
      continue;
    }

    remaining.push(arg);
  }

  return { file, remaining };
}

function parseListFilter(args) {
  let filter = 'all';

  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];

    if (arg === '--filter' || arg === '-f') {
      const value = args[index + 1];
      if (!value) {
        throw new Error('Missing value for --filter. Use all, pending, or completed.');
      }
      filter = value;
      index += 1;
      continue;
    }

    if (arg.startsWith('--filter=')) {
      const value = arg.slice('--filter='.length);
      if (!value) {
        throw new Error('Missing value for --filter. Use all, pending, or completed.');
      }
      filter = value;
      continue;
    }

    throw new Error(`Unknown list option: ${arg}`);
  }

  return filter;
}

function printTasks(tasks) {
  if (tasks.length === 0) {
    console.log('No tasks found.');
    return;
  }

  console.log('ID  Title  Status  Created At');
  tasks.forEach((task) => {
    console.log(`${task.id}  ${task.title}  ${task.status}  ${task.createdAt || ''}`);
  });
}

function printHelp() {
  console.log(HELP_TEXT);
}

function run(argv = process.argv.slice(2)) {
  try {
    if (argv.length === 0 || argv.includes('--help') || argv.includes('-h')) {
      printHelp();
      return;
    }

    const { file, remaining } = parseArgs(argv);
    const [command, ...commandArgs] = remaining;

    switch (command) {
      case 'help':
        printHelp();
        break;
      case 'add': {
        const title = commandArgs.join(' ').trim();
        if (!title) {
          throw new Error('Task title is required. Usage: task-cli add <title>');
        }
        const task = addTask(title, file);
        console.log(`Task added (ID: ${task.id})`);
        break;
      }
      case 'list': {
        const filter = parseListFilter(commandArgs);
        printTasks(listTasks(filter, file));
        break;
      }
      case 'complete': {
        const [id, ...extraArgs] = commandArgs;
        if (!id || extraArgs.length > 0) {
          throw new Error('Usage: task-cli complete <id>');
        }
        const task = completeTask(id, file);
        console.log(`Task ${task.id} marked as complete`);
        break;
      }
      case 'delete': {
        const [id, ...extraArgs] = commandArgs;
        if (!id || extraArgs.length > 0) {
          throw new Error('Usage: task-cli delete <id>');
        }
        const task = deleteTask(id, file);
        console.log(`Task ${task.id} deleted`);
        break;
      }
      default:
        throw new Error(`Unknown command: ${command}. Run task-cli help for usage.`);
    }
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exitCode = 1;
  }
}

module.exports = {
  HELP_TEXT,
  parseArgs,
  parseListFilter,
  run
};
