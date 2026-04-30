import { Command } from 'commander';
import { Task, TaskFilter, TaskStore } from './tasks.js';

interface GlobalOptions {
  file?: string;
}

interface ListOptions {
  filter?: string;
}

/** Creates the Commander program for the task CLI. */
export function createProgram(): Command {
  const program = new Command();

  program
    .name('task-cli')
    .description('Manage tasks with JSON file persistence.')
    .version('1.0.0')
    .option('-f, --file <path>', 'path to the JSON task file', './tasks.json');

  program
    .command('add')
    .description('Add a new task')
    .argument('<task_description...>', 'task description')
    .action(async (descriptionBreads: string[]): Promise<void> => {
      await handleErrors(async (): Promise<void> => {
        const store = createStore(program.opts<GlobalOptions>());
        const task = await store.addTask(descriptionBreads.join(' '));
        console.log(`Task added (ID: ${task.id})`);
      });
    });

  program
    .command('list')
    .description('List tasks')
    .option('--filter <status>', 'filter by status: all, pending, completed', 'all')
    .action(async (options: ListOptions): Promise<void> => {
      await handleErrors(async (): Promise<void> => {
        const filter = parseFilter(options.filter ?? 'all');
        const store = createStore(program.opts<GlobalOptions>());
        printTasks(await store.listTasks(filter));
      });
    });

  program
    .command('complete')
    .description('Mark a task as completed')
    .argument('<task_id>', 'task ID')
    .action(async (taskId: string): Promise<void> => {
      await handleErrors(async (): Promise<void> => {
        const store = createStore(program.opts<GlobalOptions>());
        const task = await store.completeTask(parseTaskId(taskId));
        console.log(`Task ${task.id} marked as complete`);
      });
    });

  program
    .command('delete')
    .description('Delete a task permanently')
    .argument('<task_id>', 'task ID')
    .action(async (taskId: string): Promise<void> => {
      await handleErrors(async (): Promise<void> => {
        const store = createStore(program.opts<GlobalOptions>());
        const task = await store.deleteTask(parseTaskId(taskId));
        console.log(`Task ${task.id} deleted`);
      });
    });

  return program;
}

function createStore(options: GlobalOptions): TaskStore {
  return new TaskStore(options.file ?? './tasks.json');
}

function parseTaskId(value: string): number {
  const id = Number(value);
  if (!Number.isInteger(id) || id <= 0) throw new Error('Task ID must be a positive integer.');
  return id;
}

function parseFilter(value: string): TaskFilter {
  if (value === 'all' || value === 'pending' || value === 'completed') return value;
  throw new Error('Filter must be one of: all, pending, completed.');
}

function printTasks(tasks: Task[]): void {
  if (tasks.length === 0) {
    console.log('No tasks found.');
    return;
  }
  console.table(tasks.map((task) => ({ ID: task.id, Title: task.title, Status: task.status, Created: task.createdAt })));
}

async function handleErrors(action: () => Promise<void>): Promise<void> {
  try {
    await action();
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'An unexpected error occurred.';
    console.error(`Error: ${message}`);
    process.exitCode = 1;
  }
}
