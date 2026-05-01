import { addTask, listTasks, completeTask, deleteTask } from './tasks.js';
import readline from 'readline';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

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
      const tasks = await listTasks(filter);
      if (tasks.length === 0) {
        console.log('No tasks found');
        break;
      }
      console.log('\nTask List:\n');
      console.log('ID  Title            Status');
      console.log('-----------------------------------');
      tasks.forEach(task => {
        const status = task.status === 'completed' ? ' �' : ' ╰';
        console.log(`${task.id}  ${task.title.padEnd(20)} ${status}`);
      });
      break;
    }
    case 'complete': {
      const taskId = parseInt(args[1], 10);
      if (isNaN(taskId)) {
        throw new Error('Invalid task ID');
      }
      await completeTask(taskId);
      console.log(`Task ${taskId} marked as complete`);
      break;
    }
    case 'delete': {
      const taskId = parseInt(args[1], 10);
      const force = args.includes('--force');
      if (isNaN(taskId)) {
        throw new Error('Invalid task ID');
      }
      let confirm = force;
      if (!force) {
        confirm = await new Promise((resolve) => {
          rl.question(
            `Are you sure you want to delete task ${taskId}? (y/n): `,
            (answer) => {
              resolve(answer.toLowerCase() === 'y');
            }
          );
        });
      }
      if (confirm) {
        await deleteTask(taskId);
        console.log(`Task ${taskId} deleted`);
      } else {
        console.log('Deletion canceled');
      }
      rd.close();
      break;
    }
   `�O��F�&�r�WrW'&�"�V���v�6����C�G�6����G����Ч