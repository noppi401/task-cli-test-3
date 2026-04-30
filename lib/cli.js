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
        console.log(`Task added (ID: ${task.id})`);
      } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exitCode = 1;
      }
    });

  program
    .command('list')
    .description('List tasks')
    .option('-f, --filter <status>', 'Filter by status: pending or completed')
    .action(async (options) => {
      try {
        const tasks = await taskManager.listTasks(options.filter);
        if (tasks.length === 0) {
          console.log('No tasks found.');
          return;
        }

        console.log('ID\tTitle\tStatus\tCreated At');
        tasks.forEach((task) => {
          console.log(`${task.id}\t${task.title}\t${task.status}\t${task.createdAt}`);
        });
      } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exitCode = 1;
      }
    });

  program
    .command('complete <id>')
    .description('Mark a task as completed')
    .action(async (id) => {
      try {
        const task = await taskManager.completeTask(id);
        console.log(`Task ${task.id} marked as complete`);
      } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exitCode = 1;
      }
    });

  program
    .command('delete <id>')
    .description('Delete a task')
    .action(async (id) => {
      try {
        const task = await taskManager.deleteTask(id);
        console.log(`Task ${task.id} deleted`);
      } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exitCode = 1;
      }
    });

  return program;
}
