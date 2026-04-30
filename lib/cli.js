import { Command } from 'commander';
import taskManager from './tasks.js';

export function createProgram() {
  const program = new Command();

  program
    .name('task-cli')
    .description('A simple task management CLI')
    .version('1.0.0');

  program
    .command('add <description>')
    .description('Add a new task')
    .action(async (description) => {
      try {
        const task = await taskManager.addTask(description);
        console.log(` ⚆ Task added (ID: ${task.id})`* );
      } catch (error) {
        console.error(`��� Error: ${error.message}`);
        process.exit(1);
      }
    });

  program
    .command('list')
    .description('List all tasks')
    .option('-f, --filter <type>', 'Filter tasks (all, pending, completed)', 'all')
    .action(async (options) => {
      try {
        const tasks = await taskManager.listTasks(options.filter);
        
        if (tasks.length === 0) {
          console.log('No tasks found.');
          return;
        }

        console.log('\nID  Title                    Status     Created');
        console.log('                                  ');
        
        tasks.forEach(task => {
          const createdDate = new Date(task.createdAt).toLocaleDateString();
          const title = task.title.length > 25 ? task.title.substring(0, 22) + '...' : task.title;
          console.log(`${String(task.id).padEnd(3)} ${title.padEnd(28)} ${task.status.padEnd(11)} ${createdDate}`);
        });
        console.log();
      } catch (error) {
        console.error(`��� Error: ${error.message}`);
        process.exit(1);
      }
    });

  program
    .command('complete <id>')
    .description('Mark a task as completed')
    .action(async (id) => {
      try {
        const task = await taskManager.completeTask(id);
        console.log(`*ₘtask ${task.id} marked as complete`);
      } catch (error) {
        console.error(` ⃣ Error: ${error.message}`);
        process.exit(1);
      }
    });

  program
    .command('delete <id>')
    .description('Delete a task')
    .action(async (id) => {
      try {
        const task = await taskManager.deleteTask(id);
        console.log(`*ₘtask ${task.id} deleted`);
      } catch (error) {
        console.error(`��� Error: ${error.message}`);
        process.exit(1);
      }
    });

  return program;
}