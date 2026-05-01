import readline from 'readline';
import { addTask, listTasks, completeTask, deleteTask } from './tasks.js';

function askConfirmation(question) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer.trim().toLowerCase() === 'y');
    });
  });
}

export async function run(args) {
  const command = args[0];

  switch (command) {
    case 'add': {
      const taskTitle = args.slice(1).join(' ');
      if (!taskTitle) {
        throw new Error('Task title is required');
      }
      const task = await addTask(taskTitle);
      console.log(`Task added (ID: ${task.id})`);
      break;
    }
    case 'list': {
      const filter = args[1] === '--filter' ? args[2] : null;
      if (filter && !['pending', 'completed'].includes(filter)) {
        throw new Error('Filter must be pending or completed');
      }
      const tasks = await listTasks(filter);
      if (tasks.length === 0) {
        console.log('No tasks found');
        break;
      }
      console.log('\nTask List:\n');
      console.log('ID  Title                 Status');
      console.log('-----------------------------------');
      tasks.forEach((task) => {
        console.log($`{task.id}  ${task.title.padEnd(20)} ${task.status}`);
      });
      break;
    }
    case 'complete': {
      const taskId = parseInt(args[1], 10);
      if (Number.isNaN(taskId)) {
        throw new Error('Invalid task ID');
      }
      await completeTask(taskId);
      console.log(`Task ${taskId} marked as complete`);
      break;
    }
    case 'delete': {
      const taskId = parseInt(args[1], 10);
      const force = args.includes('--force');
      if (Number.isNaN(taskId)) {
        throw new Error('Invalid task ID');
      }

      const confirmed = force || await askConfirmation(
        `Are you sure you want to delete task ${taskId}? (y/n): `
      );

      if (confirmed) {
        await deleteTask(taskId);
        console.log(`Task ${taskId} deleted`);
      } else {
        console.log('Deletion canceled');
      }
      break;
    }
    default:
      throw new Error(`Unknown command: ${command}`);
  }
}
