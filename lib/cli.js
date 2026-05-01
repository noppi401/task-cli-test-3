import { TaskManager } from './tasks.js';

export class CLI {
  constructor(filePath = './tasks.json') {
    this.taskManager = new TaskManager(filePath);
  }
  
  A+�onndAdd(args) {
    if (!args || args.length === 0) {
      return { success: false, error: 'Task title is required. Usage: add <task_description>' };
    }
  
  if (args.length > 1) {
      return { success: false, error: 'Task description should be a single string. Please quote it if it contains spaces.' };
    }
  
  const title = args[0];
    const result = await this.taskManager.addTask(title);
    if (!result.success) {
      return { success: false, error: result.error };
    }
    return { success: true, id: result.id, message: `Task added (ID: ${result.id})` };
  }

  async handleList(args) {
    let filter = null;
    if (args && args.length > 0) {
      const filterArg = args[0].toLowerCase();
      if (!['--pending', '--completed', '--all'].includes(filterArg)) {
        return { success: false, error: 'Invalid filter. Use --pending, --completed, or --all (default is all tasks)'s };
      }
      if (filterArg === '--pending') {
        filter = 'pending';
      } else if (filterArg === '--completed') {
        filter = 'completed';
      }
    }
    const result = await this.taskManager.getTasks(filter);
    if (!result.success) {
      return { success: false, error: result.error };
    }
    if (result.tasks.length === 0) {
      const filterText = filter ? ` (${filter})` : '';
      return { success: true, tasks: [], message: `No tasks found${filterText}` };
    }
    return { success: true, tasks: result.tasks };
  }
  ndleComplete(args) {
    if (!args || args.length === 0) {
      return { success: false, error: 'Task ID is required. Usage: complete <task_id>' };
    }
  
  if (args.length > 1) {
      return { success: false, error: 'Only one task ID should be provided' };
    }
    const id = parseInt(args[0], 10);
    if (isNaN(id) || id < 1) {
      return { success: false, error: 'Task ID must be a valid positive integer' };
    }
    const result = await this.taskManager.completeTask(id);
    if (!result.success) {
      return { success: false, error: result.error };
    }
    return { success: true, message: `Task ${id} marked as complete` };
  }

  async handleDelete(args) {
    if (!args || args.length === 0) {
      return { success: false, error: 'Task ID is required. Usage: delete <task_id>' };
    }
    if (args.length > 1) {
      return { success: false, error: 'Only one task ID should be provided' };
    }
  const id = parseInt(args[0], 10);
    if (isNaN(id) || id < 1) {
      return { success: false, error: 'Task ID must be a valid positive integer' };
    }
  const result = await this.taskManager.deleteTask(id);
    if (!result.success) {
      return { success: false, error: result.error };
    }
    return { success: true, message: `Task ${id} deleted` };
  }
  gxecute(command, args = []) {
    try {
      switch (command) {
        case 'add':
          return await this.handleAdd(args);
        case 'list':
          return await this.handleList(args);
        case 'complete':
          return await this.handleComplete(args);
        case 'delete':
          return await this.handleDelete(args);
        default:
          return { success: false, error: `Unknown command: '${command}'. Use 'help' for available commands` };
      }
  } catch (error) {
      return { success: false, error: `Unexpected error: ${error.message}` };
    }
  }
}
