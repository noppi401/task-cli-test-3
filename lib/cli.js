import { createTaskRepository, TaskStorageError } from './task.js';

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
  delete    Delete a task`.trim();

const VALID_FILTERS = new Set(['all', 'pending', 'completed']);

function writeLine(stream, message) {
  stream.write(`${message}\n`);
}

function parseId(value) {
  const id = Number(value);
  if (!Number.isSafeInteger(id) || id < 1) {
    throw new Error('Task id must be a positive integer.');
  }
  return id;
}

function validateTaskDescription(description) {
  if (typeof description !== 'string' || description.trim().length === 0) {
    throw new Error('Task description is required.');
  }
  return description.trim();
}

function parseListFilter(args) {
  if (args.length === 0) return 'all';
  if (args.length === 1 && !args[0].startsWith('--')) {
    if (!VALID_FILTERS.has(args[0])) {
      throw new Error('List filter must be one of: all, pending, completed.');
    }
    return args[0];
  }

  const index = args.findIndex((arg) => arg === '--filter' || arg === '-f');
  if (index === -1 || index === args.length - 1 || args.length > index + 2) {
    throw new Error('List filter must be one of: all, pending, completed.');
  }

  const filter = args[index + 1];
  if (!VALID_FILTERS.has(filter)) {
    throw new Error('List filter must be one of: all, pending, completed.');
  }

  return filter;
}

function ensureNoExtraArgs(args, command) {
  if (args.length > 1) {
    throw new Error(`Too many arguments for ${command} command.`);
  }
}

function formatTasks(tasks) {
  if (tasks.length === 0) return 'No tasks found.';

  const rows = tasks.map((task) => [
    String(task.id),
    task.title,
    task.status,
    task.createdAt
  ]);

  const labels = ['ID', 'Title', 'Status', 'CreatedAt'];
  const widths = labels.map((label, index) => Math.max(label.length, ...rows.map((row) => row[index].length)));
  const pad = (value, width) => value.padEnd(width, ' ');

  const header = labels.map((label, index) => pad(label, widths[index])).join('   ');
  const body = rows.map((row) => row.map((value, index) => pad(value, widths[index])).join('   ')).join('\n');

  return `${header}\n${body}`;
}

/**
 * Runs the CLI command.
 * @param {string[]} args
 * @param {{repository?: import('./task.js').TaskRepository, stdout?: NodeJS.WriteStream, stderr?: NodeJS.WriteStream}} [options]
 * @returns {Promise<number>} exit code
 */
export async function runCli(args, options = {}) {
  const repository = options.repository ?? createTaskRepository();
  const stdout = options.stdout ?? process.stdout;
  const stderr = options.stderr ?? process.stderr;
  const [command, ...rest] = args;

  try {
    switch (command) {
      case 'add': {
        const title = validateTaskDescription(rest.join(' '));
        const task = await repository.addTask(title);
        writeLine(stdout, `Task added (ID: ${task.id})`);
        return 0;
      }
      case 'list': {
        const filter = parseListFilter(rest);
        const tasks = await repository.listTasks(filter);
        writeLine(stdout, formatTasks(tasks));
        return 0;
      }
      case 'complete': {
        ensureNoExtraArgs(rest, 'complete');
        const id = parseId(rest[0]);
        await repository.completeTask(id);
        writeLine(stdout, `Task ${id} marked as complete`);
        return 0;
      }
      case 'delete': {
        ensureNoExtraArgs(rest, 'delete');
        const id = parseId(rest[0]);
        await repository.deleteTask(id);
        writeLine(stdout, `Task ${id} deleted`);
        return 0;
      }
      case 'help':
      case '--help':
      case '-h':
      case undefined:
        writeLine(stdout, HELP_TEXT);
        return command ? 0 : 1;
      default:
        throw new Error(`Unknown command: ${command}`);
    }
  } catch (error) {
    const prefix = error instanceof TaskStorageError ? 'Storage error' : 'Error';
    writeLine(stderr, `${prefix}: ${error.message}`);
    return 1;
  }
}

export { runCli as runCLI };
