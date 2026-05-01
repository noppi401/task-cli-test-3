const readline = require('readline');
const tasks = require('./tasks');

function printHelp() {
  console.log(`Task Management CLI

Usage:
  node index.js add <task_description>
  node index.js list [--filter all|pending|completed]
  node index.js complete <task_id>
  node index.js delete <task_id> [--yes]

Options:
  --file <path>       Use a custom tasks JSON file
  --filter <status>   Filter list output by all, pending, or completed
  --yes, -y           Skip delete confirmation
  --help, -h          Show this help message`);
}

function parseArgs(argv) {
  const args = [...argv];
  const options = {};
  const positional = [];

  for (let i = 0; i < args.length; i += 1) {
    const arg = args[i];

    if (arg === '--help' || arg === '-h') {
      options.help = true;
    } else if (arg === '--yes' || arg === '-y') {
      options.yes = true;
    } else if (arg === '--file') {
      i += 1;
      if (!args[i]) {
        throw new Error('--file requires a path');
      }
      options.filePath = args[i];
    } else if (arg === '--filter') {
      i += 1;
      if (!args[i]) {
        throw new Error('--filter requires a value');
      }
      options.filter = args[i];
    } else if (arg.startsWith('--filter=')) {
      options.filter = arg.slice('--filter='.length);
    } else if (arg.startsWith('--file=')) {
      options.filePath = arg.slice('--file='.length);
    } else if (arg.startsWith('-')) {
      throw new Error(`Unknown option: ${arg}`);
    } else {
      positional.push(arg);
    }
  }

  return { command: positional[0], values: positional.slice(1), options };
}

function askConfirmation(question) {
  return new Promise((resolve) => {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    rl.question(question, (answer) => {
      rl.close();
      resolve(/^Y(es)?$/i.test(answer.trim()));
    });
  });
}

function printTasks(taskList) {
  if (taskList.length === 0) {
    console.log('No tasks found');
    return;
  }

  console.log('ID Title Status Created');
  for (const task of taskList) {
    console.log(`${task.id} ${task.title} ${task.status} ${task.createdAt || ''}`);
  }
}

async function handleAdd(values, options) {
  const title = values.join(' ');
  const task = await tasks.addTask(title, options);
  console.log(`Task added (ID: ${task.id})`);
}

async function handleList(options) {
  const taskList = await tasks.listTasks(options);
  printTasks(taskList);
}

async function handleComplete(values, options) {
  if (values.length !== 1) {
    throw new Error('Usage: node index.js complete <task_id>');
  }

  const task = await tasks.completeTask(values[0], options);
  console.log(`Task ${task.id} marked as complete`);
}

async function handleDelete(values, options) {
  if (values.length !== 1) {
    throw new Error('Usage: node index.js delete <task_id>');
  }

  const taskId = tasks.normalizeId(values[0]);
  const data = await tasks.readTaskFile(options.filePath);
  const task = data.tasks.find((item) => Number(item.id) === taskId);

  if (!task) {
    throw new Error(`Task ${taskId} not found`);
  }

  if (!options.yes) {
    const confirmed = await askConfirmation(`Delete task ${taskId}? [y/N] `);
    if (!confirmed) {
      console.log('Delete canceled');
      return;
    }
  }

  const deletedTask = await tasks.deleteTask(taskId, options);
  console.log(`Task ${deletedTask.id} deleted`);
}

async function main(argv = process.argv.slice(2)) {
  const { command, values, options } = parseArgs(argv);

  if (options.help || !command) {
    printHelp();
    return;
  }

  switch (command) {
    case 'add':
      await handleAdd(values, options);
      break;
    case 'list':
      await handleList(options);
      break;
    case 'complete':
      await handleComplete(values, options);
      break;
    case 'delete':
      await handleDelete(values, options);
      break;
    default:
      throw new Error(`Unknown command: ${command}`);
  }
}

module.exports = {
  main,
  parseArgs,
  printTasks
};
