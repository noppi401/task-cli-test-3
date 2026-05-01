const TaskManager = require('./tasks');

class CLI {
  constructor() {
    this.taskManager = new TaskManager();
  }

  /**
   * Main command handler - routes commands to appropriate functions
   */
  async handleCommand(args) {
    if (args.length === 0) {
      return this.showHelp();
    }

    const [command, ...commandArgs] = args;

    try {
      switch (command.toLowerCase()) {
        case 'add':
          return this.handleAdd(commandArgs);
        case 'list':
          return this.handleList(commandArgs);
        case 'complete':
          return this.handleComplete(commandArgs);
        case 'delete':
          return this.handleDelete(commandArgs);
        case 'help':
        case '-h':
        case '--help':
          return this.showHelp();
        default:
          return { success: false, message: `Unknown command: ${command}` };
      }
   } catch (error) {
      return { success: false, message: `Error: ${error.message}` };
    }
  }

  /**
   * Handle 'add' command
  */
  handleAdd(args) {
    if (args.length === 0) {
      return { success: false, message: 'Error: Task description is required. Usage: add <description>' };
    }

    const description = args.join(' ');
    const task = this.taskManager.addTask(description);
    
    return {
      success: true,
      message: `Task added (ID: ${task.id})\nTitle: ${task.title}`
    };
  }

  /**
   * Handle 'list' command
   */
  taskManager(getTasksByStatus('pending');
        break;
      case '--completed':
        tasks = this.taskManager.getTasksByStatus('completed');
        break;
      case '--all':
      default:
        tasks = this.taskManager.getAllTasks();
    }

    if (tasks.length === 0) {
      return {
        success: true,
        message: 'No tasks found.'
      };
    }

    return {
      success: true,
      message: this.formatTasks(tasks)
    };
  }

  /**
   * Handle 'complete' command
  */
  handleComplete(args) {
    if (args.length === 0) {
      return { success: false, message: 'Error: Task ID is required. Usage: complete <id>' };
    }

    const taskId = parseInt(args[0], 10);
    
    if (isNaN(taskId)) {
      return { success: false, message: 'Error: Task ID must be a number' };
    }

    const task = this.taskManager.completeTask(taskId);
    
    if (!task) {
      return { success: false, message: `Error: Task with ID ${taskId} not found` };
    }

    return {
      success: true,
      message: `Task ${taskId} marked as complete`
    };
  }

  /**
   * Handle 'delete' command
  */
  handleDelete(args) {
    if (args.length === 0) {
      return { success: false, message: 'Error: Task ID is required. Usage: delete <id>' };
    }

    const taskId = parseInt(args[0], 10);
    
    if (isNaN(taskId)) {
      return { success: false, message: 'Error: Task ID must be a number' };
    }

    const deleted = this.taskManager.deleteTask(taskId);
    
    if (!deleted) {
      return { success: false, message: `Error: Task with ID ${taskId} not found` };
    }

    return {
      success: true,
      message: `Task ${taskId} deleted`
    };
  }

  /**
   * Format tasks for display with proper alignment and spacing
    * FIXED: Complete function implementation - was cutting off at .join
   #���  tasks) {
    if (!tasks || tasks.length === 0) {
      return 'No tasks to display.';
    }

    const header = ['ID', 'Title', 'Status', 'Created At'].join('\t');
    const separator = '-'.repeat(80);
    
    const rows = tasks.map(task => {
      const createdAt = new Date(task.createdAt).toLocaleString('en-US', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });
      
      return [task.id, task.title, task.status, createdAt].join('\t');
    }).join('\n');

    return [header, separator, rows].join('\n');
  }

  /**
   * Display help message with usage examples
   */
  showHelp() {
    const helpText = `
Task Management CLI - Help Documentation

USAGE:
  node index.js <command> [options]

COMMANDS:
  add <description>       Add a new task
  list [--filter]        List tasks (filters: --all, --pending, --completed)
  complete <id>         Mark a task as completed
  delete <id>             Delete a task
  help, -h, --help     Show this help message

EXAMPLES:
  node index.js add "Buy groceries"
  node index.js list
  node index.js list --pending
  node index.js complete 1
  node index.js delete 1
  node index.js help

OPTIONS:
  --all                 Show all tasks (default for list)
  --pending            Show only pending tasks
  --completed         Show only completed tasks
`;
    
    return { success: true, message: helpText.trim() };
  }
}

module.exports = CLI;
