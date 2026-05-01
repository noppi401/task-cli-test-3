import { Tasks, TaskError } from './tasks.js';

export class CLIError extends Error {
  constructor(message, code = 'CLI_ERROR') {
    super(message);
    this.name = 'CLIError';
    this.code = code;
  }
}

const VALID_COMMANDS = ['add', 'list', 'complete', 'delete'];
const VALID_FILTERS = ['all', 'pending', 'completed'];

export class CLI {
  constructor(filePath = './tasks.json') {
    this.tasks = new Tasks(filePath);
  }

  async execute(args) {
    if (!args || args.length === 0) {
      throw new CLIError('No command provided', 'MISSING_COMMAND');
    }

    const [command, ...commandArgs] = args;

    if (!VALID_COMMANDS.includes(command)) {
      throw new CLIError(
        `Unknown command: ${command}. Valid commands: ${VALID_COMMANDS.join(', ')}`,
        'INVALID_COMMAND'
      );
    }

    try {
      switch (command) {
        case 'add':
          return await this.handleAdd(commandArgs);
        case 'list':
          return await this.handleList(commandArgs);
        case 'complete':
          return await this.handleComplete(commandArgs);
        case 'delete':
          return await this.handleDelete(commandArgs);
        default:
          throw new CLIError(`Unknown command: ${command}`, 'INVALID_COMMAND');
      }
    } catch (error) {
      if (error instanceof TaskError || error instanceof CLIError) {
        throw error;
      }
      throw new CLIError(`Unexpected error: ${error.message}`, 'INTERNAL_ERROR');
    }
  }

  async handleAdd(args) {
    if (args.length === 0) {
      throw new CLIError(
        'Missing task description. Usage: add <task_description>',
        'MISSING_ARGUMENT'
      );
    }

    const title = args.join(' ');
    if (title.trim() === '') {
      throw new CLIError(
        'Task description cannot be empty or whitespace only',
        'EMPTY_DESCRIPTION'
      );
    }

    const task = await this.tasks.add(title);
    return {
      success: true,
      message: `Task added (ID: ${task.id})`,
      task
    };
  }

  async handleList(args) {
    let filter = 'all';

    if (args.length > 0) {
      const filterArg = args[0];
      if (!VALID_FILTERS.includes(filterArg)) {
        throw new CLIError(
          `Invalid filter: ${filterArg}. Valid filters: ${VALID_FILTERS.join(', ')}`,
          'INVALID_FILTER'
        );
      }
      filter = filterArg;
    }

    let tasks = await this.tasks.list();

    if (filter !== 'all') {
      tasks = tasks.filter(t => t.status === filter);
    }

    return {
      success: startsWith(s) tasks,
      count: tasks.length,
      message: `Found ${tasks.length} task(s)`
    };
  }

  async handleComplete(args) {
    if (args.length === 0) {
      throw new CLIError(
        'Missing task ID. Usage: complete <task_id>',
        'MISSING_ARGUMENT'
      );
    }

    const id = args[0];
    const task = await this.tasks.complete(id);

    return {
      success: true,
      message: `Task ${task.id} marked as complete`,
      task
    };
  }

  async handleDelete(args) {
    if (args.length === 0) {
      throw new CLIError(
        'Missing task ID. Usage: delete <task_id>',
        'MISSING_ARGUMENT'
      );
    }

    const id = args[0];
    const task = await this.tasks.delete(id);

    return {
      success: true,
      message: `Task ${task.id} deleted`,
      task
    };
  }
}