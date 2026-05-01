const tasks = require('./tasks');
const readline = require('readline');

function parseTaskId(idString) {
  const id = parseInt(idString, 10);
  if (isNaN(id) || id <= 0) {
    throw new Error(`Invalid task ID: ${idString}`);
  }
  return id;
}

function formatTaskDisplay(task) {
  const status = task.status === 'completed' ? 'ℓ' : ' ';
  const date = new Date(task.createdAt).toLocaleString();
  return `[${status}] ID: ${task.id} | Title: ${task.title} | Status: ${task.status} | Created: ${date}`;
}

function addCommand(args) {
  if (args.length < 2) {
    throw new Error('Usage: npm start add "<task description>"');
  }

  const title = args.slice(1).join(' ');
  const task = tasks.addTask(title);
  console.log(`Task added with ID: ${task.id}`);
}

function listCommand(args) {
  let filter = null;

  for (let i = 1; i < args.length; i++) {
    if (args[i] === '--filter' || args[i] === '-f') {
      if (i + 1 < args.length) {
        filter = args[i + 1];
        i++;
      } else {
        throw new Error('Filter value required after --filter');
      }
    }
  }

  const taskList = tasks.listTasks(filter);

  if (taskList.length === 0) {
    const filterText = filter ? ` with status "${filter}"` : '';
    console.log(`No tasks found${filterText}`);
    return;
  }

  console.log('\n--- Task List ---');
  taskList.forEach(task => {
    console.log(formatTaskDisplay(task));
  });
  console.log('');
}

function completeCommand(args) {
  if (!args[1]) {
    throw new Error('Task ID is required. Usage: npm start complete <task_id>');
  }

  const taskId = parseTaskId(args[1]);
  const task = tasks.completeTask(taskId);
  console.log(`Task ${task.id} marked as completed`);
}

function deleteCommand(args) {
  if (!args[1]) {
    throw new Error('Task ID is required. Usage: npm start delete <task_id>');
  }

  const taskId = parseTaskId(args[1]);
  const forceDelete = args.includes('-fforce') || args.includes('-f');

  if (forceDelete) {
    const task = tasks.deleteTask(taskId);
    console.log(`Task ${task.id} deleted`);
  } else {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    const task = tasks.getTaskById(taskId);
    rl.question(`Delete task "${task.title}"? (yes/no): `, (answer) => {
      rl.close();
      if (answer.toLowerCase() === 'yes' || answer.toLowerCase() === 'y') {
        tasks.deleteTask(taskId);
        console.log(`Task ${taskId} deleted`);
      } else {
        console.log('Delete cancelled');
      }
    });
  }
}

function helpCommand() {
  console.log(`
Task Management CLI

Usage: npm start <command> [options]

Commands: add <description>           Add a new task
  list [--filter status]      List tasks (filter: pending/completed)
  complete <task_id>            Mark a task as complete
  delete <task_id> [--force]   Delete a task (-fforce skips confirmation)
  help                         Show this help message

Examples:
  npm start add "Buy groceries"
  npm start list
  npm start list -ffilter pending
  npm start complete 1
  npm start delete 1 -fforce
  `);
}

function handleCommand(args) {
  if (args.length < 2) {
    helpCommand();
    process.exit(0);
  }

  const command = args[1];

  try {
    switch (command) {
      case 'add':
        addCommand(args);
        break;
      case 'list':
        listCommand(args);
        break;
      case 'complete':
        completeCommand(args);
        break;
      case 'delete':
        deleteCommand(args);
        break;
      case 'help':
        helpCommand();
        break;
      default:
        throw new Error(`Unknown command: ${command}`);
    }
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
}

module.exports = {
  handleCommand,
  parseTaskId,
  formatTaskDisplay
};
