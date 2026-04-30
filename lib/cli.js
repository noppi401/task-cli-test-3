import { Command } from 'commander';
import taskManager from './tasks.js';

export function createProgram(manager = taskManager) {
  const program = new Command();

  program
    .name('task-cli')
    .description('A simple task management CLI')
    .version('1.0.0');

  program
    .command('add <description>')
    .description('Add a new task')
    .action((description) => {
      try {
        const task = manager.addTask(description);
        console.log(`Task added (ID: ${task.id})`);
      } catch (error) {
        console.error(error.message);
        process.exitCode = 1;
      }
    });

  program
    .command('list')
    .description('List tasks')
    .option('-f, --filter <status>', 'Filter by status (pending or completed)')
    .action((options) => {
      try {
        const tasks = manager.listTasks(options.filter);

        if (tasks.length === 0) {
          console.log('No tasks found.');
          return;
        }

        console.log('ID  Title  Status  Created At');
        tasks.forEach((task) => {
          console.log(`${task.id}  ${task.title}  ${task.status}  ${task.createdAt}`);
        });
      } catch (error) {
        console.error(error.message);
        process.exitCode = 1;
      }
    });

  program
    .command('complete <id>')
    .description('Mark a task as completed')
    .action((id) => {
      try {
        const task = manager.completeTask(id);
        console.log(`Task ${task.id} marked as complete`);
      } catch (error) {
        console.error(error.message);
        process.exitCode = 1;
      }
    });

  program
    .command('delete <id>')
    .description('Delete a task')
    .action((id) => {
      try {
        manager.deleteTask(id);
        console.log(`Task ${id} deleted`);
      } catch (error) {
        console.error(error.message);
        process.exitCode = 1;
      }
    });

  return program;
}
