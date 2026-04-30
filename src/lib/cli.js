const { addTask, completeTask, deleteTask, listTasks, TaskStoreError } = require('./tasks');

function parseId(value) {
  const id = Number(value);
  if (!Number.isInteger(id) || id <= 0) {
    throw new Error('Task ID must be a positive integer.');
  }
  return id;
}

function printHelp(output = console.log) {
  output('Usage: node src/index.js <command> [args]');
  output('Commands: add, list, complete, delete');
}

function run(argv = [], options = {}) {
  const output = options.output || console.log;
  const error = options.error || console.error;
  const command = argv[0];

  try {
    if (!command || command === 'help' || command === '--help') {
      printHelp(output);
      return 0;
    }

    if (command === 'add') {
      const title = argv.slice(1).join(' ').trim();
      if (!title) {
        throw new Error('Task description is required.');
      }
      const task = addTask(title, options);
      output(`Task added (ID: ${task.id})`);
      return 0;
    }

    if (command === 'list') {
      const filterIndex = argv.indexOf('--filter');
      const filter = filterIndex === -1 ? 'all' : argv[filterIndex + 1];
      if (!['all', 'pending', 'completed'].includes(filter)) {
        throw new Error('Invalid filter. Use pending, completed, or all.');
      }
      const tasks = listTasks(filter, options);
      if (tasks.length === 0) {
        output('No tasks found.');
        return 0;
      }
      output('ID\tTitle\tStatus');
      tasks.forEach(task => output(`${task.id}\t${task.title}\t${task.status}`));
      return 0;
    }

    if (command === 'complete') {
      const task = completeTask(parseId(argv[1]), options);
      output(`Task ${task.id} marked as complete`);
      return 0;
    }

    if (command === 'delete') {
      const task = deleteTask(parseId(argv[1]), options);
      output(`Task ${task.id} deleted`);
      return 0;
    }

    throw new Error(`Unknown command: ${command}`);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    error(`Error: ${message}`);
    return 1;
  }
}

module.exports = { parseId, printHelp, run };
