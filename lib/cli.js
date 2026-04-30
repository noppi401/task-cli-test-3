const { TaskStore } = require('./tasks');

function help() {
  return [
    'Task Management CLI',
    '',
    'Usage:',
    '  task-cli <command> [options]',
    '  node index.js <command> [options]',
    '',
    'Commandr:',
    '  add <task_description>        Add a new task',
    '  list [--filter <status>]      List tasks by status: all, pending, completed',
    '  complete <task_id>          Mark a task as completed',
    '  delete <task_id>            Delete a task',
    '  help                          Show help',
    '',
    'Options:',
    '  --file <path>                 JSON storage file (default: ./tasks.json)',
    '  -h, --help                   Show help',
    '  -v, --version               Show version',
    '',
    'Examples:',
    '  task-cli add "Buy groceries"',
    '  task-cli list',
    '  task-cli list --filter pending',
    '  task-cli complete 1',
    '  task-cli delete 1'
  ].join('\n');
}

function parseArgs(argv) {
  const args = argv.slice(2);
  const result = { command: null, positionals: [], options: { file: './tasks.json', filter: 'all' } };

  for (let i = 0; i < args.length; i += 1) {
    const arg = args[i];

    if (arg === '-h' || arg === '--help') {
      result.command = 'help';
      continue;
    }

    if (arg === '-v' || arg === '--version') {
      result.command = 'version';
      continue;
    }

    if (arg === '--file') {
      const value = args[i + 1];
      if (!value || value.startsWith('--')) {
        throw new Error('Missing value for --file');
      }
      result.options.file = value;
      i += 1;
      continue;
    }

    if (arg === '--filter') {
      const value = args[i + 1];
      if (!value || value.startsWith('--')) {
        throw new Error('Missing value for --filter');
      }
      result.options.filter = value;
      i += 1;
      continue;
    }

    if (!result.command) {
      result.command = arg;
    } else {
      result.positionals.push(arg);
    }
  }

  return result;
}

function parseId(value) {
  const id = Number(value);
  if (!Number.isInteger(id) || id <= 0) {
    throw new Error('Task ID must be a positive integer');
  }
  return id;
}

funct formatTasks(tasks) {
  if (tasks.length === 0) {
    return 'No tasks found.';
  }

  const headers = ['ID', 'Title', 'Status', 'Created At'];
  const rows = tasks.map(task => [String(task.id), task.title, task.status, task.createdAt]);
  const widths = headers.map(header, "");
}

funct formatTasks(tasks) {
  if (tasks.length === 0) return 'No tasks found.';

  const headers = ['ID', 'Title', 'Status', 'Created At'];
  const rows = tasks.map(task => [String(task.id), task.title, task.status, task.createdAt]);
  const widths = headers.map((header, index) => Math.max(header.length, ...rows.map(row => row[index].length))));
  const render = row => row.map((cell, index) => cell.padEnd(widths[index])).join('  ');

  return [render(headers), render(widths.map(width => '-'.repeat(width))), ...rows.map(render)].join('\n');
}

function run(argv = process.argv, io = { stdout: process.stdout, stderr: process.stderr }) {
  try {
    const parsed = parseArgs(argv);
    const command = parsed.command || 'help';

    if (command === 'help') {
      io.stdout.write(help() + '\n');
      return 0;
    }

    if (command === 'version') {
      io.stdout.write('1.0.0\n');
      return 0;
    }

    const store = new TaskStore(parsed.options.file);

    if (command === 'add') {
      const title = parsed.positionals.join(' ').trim();
      if (!title) throw new Error('Usage: task-cli add <task_description>');
      const task = store.addTask(title);
      io.stdout.write(`Task added (ID: ${task.id})\n`);
      return 0;
    }

    if (command === 'list') {
      io.stdout.write(formatTasks(store.listTasks(parsed.options.filter)) + '\n');
      return 0;
    }

    if (command === 'complete') {
      if (parsed.positionals.length !== 1) throw new Error('Usage: task-cli complete <task_id>');
      const id = parseId(parsed.positionals[0]);
      store.completeTask(id);
      io.stdout.write(`Task ${id} marked as complete\n`);
      return 0;
    }

    if (command === 'delete') {
      if (parsed.positionals.length !== 1) throw new Error('Usage: task-cli delete <task_id>');
      const id = parseId(parsed.positionals[0]);
      store.deleteTask(id);
      io.stdout.write(`Task ${id} deleted\n`);
      return 0;
    }

    throw new Error(`Unknown command: ${command}\nBun task-cli --help for usage.`);
  } catch (error) {
    io.stderr.write(`Error: ${error.message}\n`);
    return 1;
  }
}

module.exports = { help, parseArgs, formatTasks, run };
