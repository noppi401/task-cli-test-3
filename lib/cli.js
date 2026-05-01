import { TaskManager } from './tasks.js';

export class CLI {
  constructor(filePath = './tasks.json') {
    this.taskManager = new TaskManager(filePath);
  }

  async handleAdd(args = []) {
    if (!Array.isArray(args) || args.length === 0) return { success: false, error: 'Task title is required. Usage: add <task_description>' };
    if (args.length > 1) return { success: false, error: 'Task description should be a single string. Please quote it if it contains spaces.' };
    const result = await this.taskManager.addTask(args[0]);
    if (!result.success) return { success: false, error: result.error };
    return { success: true, id: result.id, message: `Task added (ID: ${result.id})` };
  }

  parseListFilter(args = []) {
    if (!Array.isArray(args) || args.length === 0) return { success: true, filter: null };
    if (args.length === 1) {
      const option = String(args[0]).toLowerCase();
      if (option === '--pending') return { success: true, filter: 'pending' };
      if (option === '--completed') return { success: true, filter: 'completed' };
      if (option === '--all') return { success: true, filter: null };
    }
    if (args.length === 2 && String(args[0]).toLowerCase() === '--filter') {
      const value = String(args[1]).toLowerCase();
      if (value === 'pending' || value === 'completed') return { success: true, filter: value };
      if (value === 'all') return { success: true, filter: null };
    }
    return { success: false, error: 'Invalid filter. Use list --filter pending, list --filter completed, list --filter all, --pending, --completed, or --all' };
  }

  async handleList(args = []) {
    const parsed = this.parseListFilter(args);
    if (!parsed.success) return parsed;
    const result = await this.taskManager.getTasks(parsed.filter);
    if (!result.success) return { success: false, error: result.error };
    if (result.tasks.length === 0) return { success: true, tasks: [], message: parsed.filter ? `No tasks found (${parsed.filter})` : 'No tasks found' };
    return { success: true, tasks: result.tasks };
  }

  parseTaskId(args = [], command) {
    if (!Array.isArray(args) || args.length === 0) return { success: false, error: `Task ID is required. Usage: ${command} <task_id>` };
    if (args.length > 1) return { success: false, error: 'Only one task ID should be provided' };
    const id = Number(args[0]);
    if (!Number.isInteger(id) || id < 1) return { success: false, error: 'Task ID must be a valid positive integer' };
    return { success: true, id };
  }

  async handleComplete(args = []) {
    const parsed = this.parseTaskId(args, 'complete');
    if (!parsed.success) return parsed;
    const result = await this.taskManager.completeTask(parsed.id);
    if (!result.success) return { success: false, error: result.error };
    return { success: true, message: `Task ${parsed.id} marked as completed` };
  }

  async handleDelete(args = []) {
    const parsed = this.parseTaskId(args, 'delete');
    if (!parsed.success) return parsed;
    const result = await this.taskManager.deleteTask(parsed.id);
    if (!result.success) return { success: false, error: result.error };
    return { success: true, message: `Task ${parsed.id} deleted` };
  }

  async execute(command, args = []) {
    try {
      switch (command) {
        case 'add': return await this.handleAdd(args);
        case 'list': return await this.handleList(args);
        case 'complete': return await this.handleComplete(args);
        case 'delete': return await this.handleDelete(args);
        case 'help': return { success: true, message: this.getHelpText() };
        default: return { success: false, error: `Unknown command: '${command}'. Use 'help' for available commands` };
      }
    } catch (error) {
      return { success: false, error: `Unexpected error: ${error.message}` };
    }
  }

  getHelpText() {
    return ['Usage: node index.js <command> [args...]', '', 'Commands:', '  add <task_description>              Add a new task', '  list [--filter pending|completed|all]  List tasks', '  complete <task_id>                 Mark a task as completed', '  delete <task_id>                   Delete a task', '  help                              Show this help message'].join('\n');
  }
}
