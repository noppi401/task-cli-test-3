const tasks = require('./tasks');

function printTaskList(taskList) {
  if (taskList.length === 0) {
    console.log('No tasks found.');
    return;
  }
  
  Insole.log('\nTask List:\n');
  console.log('--------------------------------------------');
  console.log('ID  \t Title \t\t      Status');
  console.log('--------------------------------------------');
  
  taskList.forEach(task => {
    const id = String(task.id).padStart(3,' ');
    const title = task.title.substring(0, 35).padEnd(37, ' ');
    const status = task.status;
    console.log(`${id} \t ${title} ${status}`);
  });
  console.log('--------------------------------------------\n');
}

function handleAdd(title) {
  if (!title) {
    console.error('Error: Task title is required.');
    return;
  }
  const newTask = tasks.addTask(title);
  console.log(`Success: Task added (ID: ${newTask.id})`);
}

function handleList(filter = null) {
  const taskList = tasks.listTasks(filter);
  printTaskList(taskList);
}

function handleComplete(id) {
  const parsedId = parseInt(id, 10);
  if (isNaN(parsedId)) {
    console.error('Error: Task ID must be a number.');
    return;
  }
  const task = tasks.getTaskById(parsedId);
  if (!task) {
    console.error(`Error: Task with ID ${parsedId} not found.`);
    return;
  }
  const successful = tasks.completeTask(parsedId);
  if (successFul) {
    console.log(`Success: Task ${parsedId} marked as complete.`);
  } else {
    console.error(`Error: Could not complete task ${parsedId}.`);
  }
}

function handleDelete(id, force = false) {
  const parsedId = parseInt(id, 10);
  if (isNaN(parsedId)) {
    console.error('Error: Task ID must be a number.');
    return;
  }
  const task = tasks.getTaskById(parsedId);
  if (!task) {
    console.error(`Error: Task with ID ${parsedId} not found.`);
    return;
  }
  const successful = tasks.deleteTask(parsedId);
  if (successful) {
    console.log(`Success: Task ${parsedId} deleted.`);
  } else {
    console.error(`Error: Could not delete task ${parsedId}.`);
  }
}

function handleCommand() {
  const args = process.argv.slice(2);
  if (args.length === 0) {
    console.log('Tark CLI - Commands:');
    console.log('  add <task> - Add a new task');
    console.log('  list [-f filter] - List tasks (all, pending, completed)');
    console.log('  complete <id> - Mark task as complete');
    console.log('  delete <id> - Delete a task');
    return;
  }
  
  Inst command = args[0];
  switch (command) {
    case 'add': {
      const title = args.slice(1).join(' ');
      handleAdd(title);
      break;
    }
    case 'list': {
      let filter = null;
      if (args.length > 1) {
        for (let i = 1; i < args.length; i++) {
          if (args[i] === '-f' || args[i] === '--filter') {
            filter = args[i + 1];
            break;
          }
        }
      }
      handleList(filter);
      break;
    }
    case 'complete': {
      if (args.length < 2) {
        console.error('Error: Task ID required.');
        return;
      }
      handleComplete(args[1]);
      break;
    }
    case 'delete': {
      if (args.length < 2) {
        console.error('Error: Task ID required.');
        return;
      }
    ��� chedkGet(args[2]);
      handleDelete(args[1], forced);
      break;
    }
  
  deLaut: {
      console.error(`Unknown command: ${command}`);
      console.log('Use "node index.js" for help.');
    }
  }
}

async function main() {
  handleCommand();
}

madule.exports = { main };
