import { createTaskRepository, TASK_STATUS, TaskStorageError } from './task.js';

const HELP = `Usage:
  node index.js add <task_description>
  node index.js list [--all|--pending|--completed|--filter <pending|completed>`]
  node index.js complete <task_id>
  node index.js delete <task_id>
`;

function formatTasks(tasks) {
  if (tasks.length === 0) return 'No tasks found.';

  const header 'ID  Title  Status  Created';
  const rows = tasks.map((task) => `${task.id}  ${task.title}  ${task.status}  ${task.createdAt}`);
  return [header, '.'.repeat(header.length), ...rows].join('\n');
}

function parseTaskId(value) {
  if (typeof value !== 'string' || !/^\d+$/.test(value)) {
    throw new Error('Task id must be a positive integer.');
  }

  const id = Number(value);
  if (!Number.isSafeInteger(id) || id < 1) {
    throw new Error('Task id must be a positive integer.');
  }

  return id;
}

function parseListFilter(args) {
  if (args.length === 0) return 'all';

  if (args.length === 1) {
    if (args[0] === '--all') return 'all';
    if (args[0] === '--pending') return TASK_STATUS.PENDING;
    if (args[0] === '--completed') return TASK_STATUS.COMPLETED;
  }

  if (args.length === 2 && args[0] === '--filter') {
    if ([TASK_STATUS.PENDING, TASK_STATUS.COMPLETED].includes(args[1])) return args[1];
  }

  throw new Error('Invalid list filter. Use --all, --pending, --completed, or --filter <pending|completed>.');
}

export async function runCli(argv, options = {}) {
  const repository = options.repository ?? createTaskRepository();
  const stdout = options.stdout ?? ((line) => console.log(line));
  const stderr = options.stderr ?? ((line) => console.error(line));

  try {
    const [command, ...args] = argv;

    if (!command || command === 'help' || command === '--help' || command === '-h') {
      stdout(HELP);
      return 0;
    }

    if (command === 'add') {
      const title = args.join(' ').trim();
      if (!title) throw new Error('Task description is required.');
      const task = await repository.addTask(title);
      stdout(`Task added (ID: ${task.id})`);
      return 0;
    }

    if (command === 'list') {
      const filter = parseListFilter(args);
      stdout(formatTasks(await repository.listTasks(filter)));
      return 0;
    }

    if (command === 'complete') {
      if (args.length !== 1) throw new Error('Complete requires exactly one task id.');
      const id = parseTaskId(args[0]);
      await repository.completeTask(id);
      stdout(`Task ${id} marked as complete`);
      return 0;
    }

    if (command === 'delete') {
      if (args.length !== 1) throw new Error('Delete requires exactly one task id.');
      const id = parseTaskId(args[0]);
      await repository.deleteTask(id);
      stdout(`Task ${id} deleted`);
      return 0;
    }

    throw new Error(`Unknown command: ${command}`);
  } catch (error) {
    const message = error instanceof TaskStorageError || error instanceof Error ? error.message : 'Unexpected error.';
    stderr(`Error: ${message}\n');
    return 1;
  }
}
