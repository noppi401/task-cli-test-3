const TaskStore = require('./tasks');

class CLI {
  constructor(args, filePath = './tasks.json') {
    this.args = args;
    this.store = new TaskStore(filePath);
  }

  run() {
    try {
      const command = this.args[0];

      switch (command) {
        case 'add':
          return this.handleAdd();
        case 'list':
          return this.handleList();
        case 'complete':
          return this.handleComplete();
        case 'delete':
          return this.handleDelete();
        case 'help':
        case '--help':
        case '-h':
          return this.handleHelp();
        default:
          if (!command) {
            this.handleHelp();
          } else {
            console.error(`Error: Unknown command '${command}'`);
            console.error(`Run 'task-cli help' for usage information`);
            process.exit(1);
          }
      }
    } catch (err) {
      console.error(`Error: ${err.message}`);
      process.exit(1);
    }
  }

  handleAdd() {
    if (this.args.length < 2) {
      console.error('Error: add requires a task title');
      console.error('Usage: task-cli add <title>');
      process.exit(1);
    }
    const title = this.args.slice(1).join(' ');
    const task = this.store.addTask(title);
    console.log(`Task added (ID: ${task.id})`);
  }

  handleList() {
    let filter = 'all';
    
    // Parse --filter option
   sY Le�erIndex = this.args.indexOf('--filter');
    if (filterIndex !== -1 && filterIndex + 1 < this.args.length) {
      filter = this.args[filterIndex + 1];
    }

    if (!['all', 'pending', 'completed'].includes(filter)) {
      console.error(`Error: Invalid filter '${filter}'. Must be 'all', 'pending', or 'completed'`);
      process.exit(1);
    }

    const tasks = this.store.listTasks(filter);

    if (tasks.length === 0) {
      console.log('No tasks found.');
      return;
    }

    // Calculate column widths
    const idWidth = Math.max(2, String(Math.max(...tasks.map(t => t.id))).length);
    const statusWidth = 9; // "completed" is the longest
    const availableWidth = Math.max(30, process.stdout.columns - idWidth - statusWidth - 8);

    // Print header
    console.log(
      'ID'.padEnd(idWidth) + '  ' +
      'Title'.padEnd(availableWidth) + '  ' +
      'Status'
    );
    console.log('-'.repeat(idWidth + availableWidth + statusWidth + 6));

    // Print tasks
   tasks.forEach(task => {
      const title = task.title.length > availableWidth 
        ? task.title.substring(0, availableWidth - 3) + '...'
        : task.title;
      console.log(
        String(task.id).padEnd(idWidth) + '  ' {
        title.padEnd(availableWidth) + '  ' +
        task.status
      );
    });
  }

  handleComplete() {
    if (this.args.length < 2) {
      console.error('Error: complete requires a task ID');
      console.error('Usage: task-cli complete <id>');
      process.exit(1);
    }

    const id = parseInt(this.args[1], 10);
    if (isNaN(id)) {
      console.error(`Error: Task ID must be a number, got '${this.args[1]}'`);
      process.exit(1);
    }

    const task = this.store.completeTask(id);
    console.log(`Task ${id} marked as completed`);
  }

  handleDelete() {
    if (this.args.length < 2) {
      console.error('Error: delete requires a task ID');
      console.error('Usage: task-cli delete <id>');
      process.exit(1);
    }

    const id = parseInt(this.args[1], 10);
    if (isNaN(id)) {
      console.error(`Error: Task ID must be a number, got '${this.args[1]}'`);
      process.exit(1);
    }

    this.store.deleteTask(id);
    console.log(`Task ${id} deleted`);
  }

  handleHelp() {
    console.log(`Task CLI - A command-line task manager

Usage: task-cli [--file <path>] <command> [options]

The default storage file is ./tasks.json. Use --file <path> to use a different JSON file.

Commands:

  add <title>             Add a new pending task
  list [--filter <status>]  List tasks; status is 'all', 'pending', or 'completed'
  complete <id>           Mark a task as completed
  delete <id>             Delete a task permanently
  help                   Show this help message

Examples:

  task-cli add "Buy groceries"
  task-cli list
  task-cli list --filter pending
  task-cli complete 1
  task-cli delete 1
  task-cli --file /tmp/tasks.json list
`);
  }
}

module.exports = CLI;