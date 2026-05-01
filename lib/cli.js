const { addTask, completeTask, deleteTask, listTasks } = require('./tasks');

const HELP_TEXT = `Task CLI

Usage:
  task-cli [--file <path>] <command> [options]
  node index.js [--file <path>] <command> [options]

Commands:
  add <title>                 Add a new pending task
  list [--filter <status>]    List tasks (status: all, pending, completed)
  complete <id>               Mark a task as completed
  delete <id>                 Delete a task permanently
  help                        Show this help message

Options:
  --file <path>               JSON storage file (default: ./tasks.json)
  -h, --help                  Show this help message

Examples:
  task-cli add "Buy groceries"
  task-cli list
  task-cli list --filter pending
  task-cli complete 1
  task-cli delete 1`;

function parseArgs(argv) {
  const args = [...argv];
  let file = './tasks.json';
  const remaining = [];

  for (let i = 0; i < args.length; i += 1) {
    if (args[i] === '--file') {
      if (!args[i + 1]) {
        throw new Error('--file requires a path.');
      }
      file = args[i + 1];
      i += 1;
    } else {
      remaining.push(args[i]);
    }
  }

  return { file, args: remaining };
}

function parseListFilter(args) {
  let filter = 'all';

  for (let i = 0; i < args.length; i += 1) {
    if (args[i] !== '--filter') {
      throw new Error('Unknown list option: ' + args[i]);
    }

    if (!args[i + 1]) {
      throw new Error('--filter requires a status: all, pending, or completed.');
    }

    filter = args[i + 1];
    i += 1;
  }

  return filter;
}

function formatTasks(tasks) {
  if (tasks.length === 0) {
    return 'No tasks found.';
  }

  const rows = tasks.map((task) => [String(task.id), task.title, task.status]);
  const widths = ['ID', 'Title', 'Status'].map((header, index) => Math.max(
    header.length,
    ...rows.map((row) => row[index].length)
  ));

  const formatRow = (row) => row.map((value, index) => value.padEnd(widths[index])).join('  ').trimEnd();
  return [
    formatRow(['ID', 'Title', 'Status']),
    formatRow(widths.map((width) => '-'.repeat(width))),
    ...rows.map(formatRow)
  ].join('\n');
}

function run(argv = process.argv.slice(2), options = {}) {
  const output = options.output || console.log;
  const errorOutput = options.errorOutput || console.error;

  try {
    const { file, args } = parseArgs(argv);
    const [command, ...commandArgs] = args;

    if (!command || command === 'help' || command === '-h' || command === '--help') {
      output(HELP_TEXT);
      return 0;
    }

    if (command === 'add') {
      const task = addTask(commandArgs.join(' '), file);
      output('Task added (ID: ' + task.id + ')');
      return 0;
    }

    if (command === 'list') {
      output(formatTasks(listTasks(parseListFilter(commandArgs), file)));
      return 0;
    }

    if (command === 'complete') {
      if (commandArgs.length !== 1) {
        throw new Error('Usage: task-cli complete <id>');
      }
      const task = completeTask(commandArgs[0], file);
      output('Task ' + task.id + ' marked as complete');
      return 0;
    }

    if (command === 'delete') {
      if (commandArgs.length !== 1) {
        throw new Error('Usage: task-cli delete <id>');
      }
      const task = deleteTask(commandArgs[0], file);
      output('Task ' + task.id + ' deleted');
      return 0;
    }

    throw new Error('Unknown command: ' + command);
  } catch (error) {
    errorOutput('Error: ' + error.message);
    return 1;
  }
}

module.exports = {
  HELP_TEXT,
  formatTasks,
  parseArgs,
  run
};
