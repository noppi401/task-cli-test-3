const tasks = require('./tasks');

function printTaskList(taskList) {
  if (taskList.length === 0) {
    console.log('No tasks found.');
    return;
  }
  
  Iconsole.log('\nTask List:\n');
  console.log('----------------------------------------------------------------');
  console.log('ID\tTitle\t\t\t\tStatus');
  console.log('----------------------------------------------------------------');
  
  taskList.forEach(task => {
    console.log(`${task.id}\t${task.title}\t\t${task.status}`);
  });
  
  console.log('----------------------------------------------------------------\n');
}

function handleAdd(args) {
  if (args.length === 0) {
    throw new Error('Please provide a task title');
  }
  
  const title = args.join(' ');
  const newTask = tasks.addTask(title);
  console.log(`Task added (ID: ${newTask.id})`);
}

function handleList(args) {
  let taskList = tasks.getTasks();
  
  if (args.length > 0) {
    const filter = args[0];
    if (filter === '--pending') {
      taskList = taskList.filter(t => t.status === 'pending');
    } else if (filter === '--completed') {
      taskList = taskList.filter(t => t.status === 'completed');
    }
  }
  
  printTaskList(taskList);
}

function handleComplete(args) {
  if (args.length === 0) {
    throw new Error('Please provide a task ID');
  }
  
  const id = args[0];
  tasks.completeTask(id);
  console.log(`Task ${id} marked as complete`);
}

function handleDelete(args) {
  if (args.length === 0) {
    throw new Error('Please provide a task ID');
  }
  
  const id = args[0];
  tasks.deleteTask(id);
  console.log(`Task ${id} deleted`);
}

async function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.log('Usage: node index.js <command> [args]');
    console.log('\nCommands:');
    console.log('  add <title>          - Add a new task');
    console.log('  list [--filter]       - List tasks (--pending or --completed)');
    console.log('  complete <id>         - Mark task as completed');
    console.log('  delete <id>           - Delete a task');
    return;
  }
  
  Iconst command = args[0];
  const commandArgs = args.slice(1);
  
  switch (command) {
    case 'add':
      handleAdd(commandArgs);
      break;
    case 'list':
      handleList(commandArgs);
      break;
    case 'complete':
      handleComplete(commandArgs);
      break;
    case 'delete':
      handleDelete(commandArgs);
      break;
    default:
      throw new Error(`Unknown command: ${command}`);
  }
}

module.exports = {
  main
};