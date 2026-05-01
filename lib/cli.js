const { TaskStore } = require('./tasks');

function parseGlobalOptions(args) {
  const parsedArgs = [];
  let filePath = './tasks.json';

  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];

    if (arg === '--file') {
      const value = args[index + 1];
      if (!value || value.startsWith('-')) {
        throw new Error('Option --file requires a path');
      }
      filePath = value;
      index += 1;
      continue;
    }

    if (arg.startsWith('--file=')) {
      const value = arg.slice('--file='.length).trim();
      if (!value) {
        throw new Error('Option --file requires a path');
      }
      filePath = value;
      continue;
    }

    parsedArgs.push(arg);
  }

  return { args: parsedArgs, filePath };
}

async function run(argv = process.argv) {
  let parsed;
  try {
    parsed = parseGlobalOptions(argv.slice(2));
  } catch (error) {
    console.error(`Error: ${error.message}`);
    return 1;
  }

  const args = parsed.args;
  const command = args.shift();

  if (!command || command === 'help' || command === '--help' || command === '-h') {
    console.log(`Task Management CLI

Usage:
  task-cli [--file <path>] <command> [options]

Commands:
  add <title>                  Add a new task
  list [--filter <status>]     List tasks (all, pending, completed)
  complete <id>                Mark a task as completed
  delete <id>                  Delete a task
  help                        Show help

Options:
  --file <path>                JSON storage file (default: ./tasks.json)
  -h, --help                  Show help

Examples:
  task-cli add "Buy groceries"
  task-cli --file custom.json add "Buy groceries"
  task-cli add "Buy groceries" --file custom.json
  task-cli list
  task-cli list --filter pending
  task-cli complete 1
  task-cli delete 1`);
    return 0;
  }

  const store = new TaskStore(parsed.filePath);

  try {
    if (command === 'add') {
      const title = args.join(' ').trim();
      if (!title) throw new Error('Task title is required');
      const task = store.addTask(title);
      console.log(`Task added (ID: ${task.id})`);
      return 0;
    }

    if (command === 'list') {
      const filterIndex = args.indexOf('--filter');
      const filter = filterIndex === -1 ? 'all' : args[filterIndex + 1];
      const tasks = store.listTasks(filter);
      if (tasks.length === 0) {
        console.log(filter === 'all' ? 'No tasks found.' : `No ${filter} tasks found.`);
        return 0;
      }

      const rows = [
        ['ID', 'Title', 'Status', 'Created At'],
        ['--', '-----', '------', '----------'],
        ...tasks.map(task => [String(task.id), task.title, task.status, task.createdAt || ''])
      ];
      const widths = rows[0].map((_, column) => Math.max(...rows.map(row => String(row[column]).length)));
      for (const row of rows) {
        console.log(row.map((value, column) => String(value).padEnd(widths[column])).join('  ').trimEnd());
      }
      return 0;
    }

    const id = Number(args[0]);
    if (!Number.isInteger(id) || id <= 0) throw new Error('Task ID must be a positive integer');

    if (command === 'complete') {
      store.completeTask(id);
      console.log(`Task ${id} marked as complete`);
      return 0;
    }

    if (command === 'delete') {
      store.deleteTask(id);
      console.log(`Task ${id} deleted`);
      return 0;
    }

    throw new Error(`Unknown command: ${command}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    return 1;
  }
}

module.exports = { run, parseGlobalOptions };
