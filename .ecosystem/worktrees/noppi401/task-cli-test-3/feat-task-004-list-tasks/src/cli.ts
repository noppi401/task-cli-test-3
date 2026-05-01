import { formatError, formatTaskAdded, formatTaskCompleted, formatTaskDeleted, formatTasksTable } from './format.js';
import { TaskStore } from './tasks.js';
import { FilterType } from './types.js';

export class CLI {
  constructor(private readonly store: TaskStore) {}

  async run(args: string[]): Promise<string> {
    try {
      const [command, ...rest] = args;

      switch (command) {
        case 'add':
          return await this.add(rest);
        case 'list':
          return await this.list(rest);
        case 'complete':
          return await this.complete(rest);
        case 'delete':
          return await this.delete(rest);
        case 'help':
        case '--help':
        case '-h':
        case undefined:
          return this.help();
        default:
          return formatError(`Unknown command: ${command}`);
      }
    } catch (error) {
      return formatError(error instanceof Error ? error.message : 'An unexpected error occurred');
    }
  }

  private async add(args: string[]): Promise<string> {
    const title = args.join(' ').trim();
    if (title.length === 0) {
      return formatError('Task description is required');
    }

    const task = await this.store.addTask(title);
    return formatTaskAdded(task.id);
  }

  private async list(args: string[]): Promise<string> {
    const filter = this.parseListFilter(args);
    const tasks = await this.store.listTasks(filter);
    return formatTasksTable(tasks);
  }

  private async complete(args: string[]): Promise<string> {
    const id = this.parseTaskId(args[0]);
    const task = await this.store.completeTask(id);
    return formatTaskCompleted(task.id);
  }

  private async delete(args: string[]): Promise<string> {
    const id = this.parseTaskId(args[0]);
    const task = await this.store.deleteTask(id);
    return formatTaskDeleted(task.id);
  }

  private parseListFilter(args: string[]): FilterType {
    if (args.length === 0) {
      return 'all';
    }

    const [first, second, ...extra] = args;
    if (extra.length > 0) {
      throw new Error('Usage: list [--filter all|pending|completed]');
    }

    const value = first === '--filter' || first === '-f' ? second : first;
    if (!value) {
      throw new Error('Filter value is required');
    }
    if (value === 'all' || value === 'pending' || value === 'completed') {
      return value;
    }
    throw new Error('Filter must be one of: all, pending, completed');
  }

  private parseTaskId(value: string | undefined): number {
    if (!value) {
      throw new Error('Task ID is required');
    }

    const id = Number(value);
    if (!Number.isInteger(id) || id <= 0) {
      throw new Error('Task ID must be a positive integer');
    }
    return id;
  }

  private help(): string {
    return [
      'Usage: task-cli <command> [options]',
      '',
      'Commands:',
      '  add <task_description>                  Add a new task',
      '  list [--filter all|pending|completed]  List tasks',
      '  complete <task_id>                     Mark a task as completed',
      '  delete <task_id>                       Delete a task'
    ].join('\n');
  }
}
