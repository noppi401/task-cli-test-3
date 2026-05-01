const tasks=require('./tasks');
const readline=require('readline');

function parseTaskId(value) {
  const id=Number(value);
  if (!Number.isInteger(id) || id < 1) {
    throw new Error('Invalid task ID: ' + value);
  }
  return id;
}

function formatTaskDisplay(task) {
  const status=task.status==='completed' ? 'x' : ' ';
  const date=new Date(task.createdAt).toLocaleString();
  return '[' + status + '] ID: ' + task.id + ' | Title: ' + task.title + ' | Status: ' + task.status + ' | Created: ' + date;
}

function addCommand(args) {
  if (args.length < 2) {
    throw new Error('Usage: npm start add "<task description>"');
  }
  const task=tasks.addTask(args.slice(1).join(' '));
  console.log('Task added with ID: ' + task.id);
}

function listCommand(args) {
  let filter=null;
  for (let i=1;i<args.length;i++) {
    if (args[i]==='--filter' || args[i]==='-f') {
      if (!args[i+1]) {
        throw new Error('Filter value required after --filter');
      }
      filter=args[++i];
    }
  }

  const taskList=tasks.listTasks(filter);
  if (taskList.length===0) {
    const filterText=filter ? ' with status "' + filter + '"' : '';
    console.log('No tasks found' + filterText);
    return;
  }

  console.log('\n--- Task List ---');
  taskList.forEach(task => console.log(formatTaskDisplay(task)));
  console.log('');
}

function completeCommand(args) {
  if (!args[1]) {
    throw new Error('Task ID is required. Usage: npm start complete <task_id>');
  }
  const task=tasks.completeTask(parseTaskId(args[1]));
  console.log('Task ' + task.id + ' marked as completed');
}

function deleteCommand(args) {
  return new Promise((resolve, reject) => {
    if (!args[1]) {
      reject(new Error('Task ID is required. Usage: npm start delete <task_id>'));
      return;
    }

    let taskId;
    try {
      taskId=parseTaskId(args[1]);
    } catch (error) {
      reject(error);
      return;
    }

    const forceDelete=args.includes('--force') || args.includes('-f') || args.includes('-fforce');
    const runDelete=() => {
      try {
        const deletedTask=tasks.deleteTask(taskId);
        console.log('Task ' + deletedTask.id + ' deleted');
        resolve();
      } catch (error) {
        reject(error);
      }
    };

    if (forceDelete) {
      runDelete();
      return;
    }

    let task;
    try {
      task=tasks.getTaskById(taskId);
    } catch (error) {
      reject(error);
      return;
    }

    const rl=readline.createInterface({
      input:process.stdin,
      output:process.stdout
    });

    rl.question('Delete task "' + task.title + '"? (yes/no): ', (answer) => {
      rl.close();
      if (answer.trim().toLowerCase()==='yes' || answer.trim().toLowerCase()==='y') {
        runDelete();
      } else {
        console.log('Deletion cancelled');
        resolve();
      }
    });
  });
}

function showHelp() {
  console.log('Task Management CLI\n\nUsage:\n  npm start add "<task description>"\n  npm start list [--filter pending|completed]\n  npm start complete <task_id>\n  npm start delete <task_id> [--force]');
}

async function handleCommand(argv) {
  const args=argv.slice(2);
  try {
    switch (args[0]) {
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
        await deleteCommand(args);
        break;
      case 'help':
      case '--help':
      case '-h':
      case undefined:
        showHelp();
        break;
      default:
        throw new Error('Unknown command: ' + args[0]);
    }
  } catch (error) {
    console.error('Error: ' + error.message);
    process.exit(1);
  }
}

module.exports={
  handleCommand,
  parseTaskId,
  formatTaskDisplay,
  addCommand,
  listCommand,
  completeCommand,
  deleteCommand
};
