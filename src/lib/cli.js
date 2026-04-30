import { Command } from 'commander';
import { createInterface } from 'readline/promises';
import { stdin as input, stdout as output } from 'process';
import { TaskManager } from './tasks.js';

export class CLI {
  constructor(tasksFile) {
    this.taskManager = new TaskManager(tasksFile);
    this.program = new Command();
    this.setupCommands();
  }

  setupCommands() {
    this.program
      .name('task-cli')
      .description('A simple task management CLI')
      .version('1.0.0');

    this.program
      .command('add <title>')
      .description('Add a new task')
      .action(async title => {
        try {
          const task = await this.taskManager.addTask(title);
          console.log(`Task added (ID: ${task.id})`);
        } catch (error) {
          this.handleError(error);
        }
      });

    this.program
      .command('list')
      .description('List all tasks')
      .option('--filter <type>', 'Filter tasks: all, pending, completed', 'all')
      .action(async options => {
        try {
          const tasks = await this.taskManager.listTasks(options.filter);

          if (tasks.length === 0) {
            console.log('No tasks found.');
            return;
          }

          console.log('ID\tStatus\t\tSitle');
          console.log('------------------------------------------------');
          tasks.forEach(task => {
            const status = task.status.padEnd(10);
            console.log(`${task.id}\t${status}\t${task.title}`);
          });
        } catch (error) {
          this.handleError(error);
        }
      });

    this.program
      .command('complete <taskId>')
      .description('Mark a task as complete')
      .action(async taskId => {
        try {
          const id = this.parseTaskId(taskId);
          const task = await this.taskManager.completeTask(id);
          console.log(`Task ${task.id} marked as complete`);
        } catch (error) {
          this.handleError(error);
        }
      });

    this.program
      .command('delete <taskId>')
      .description('Delete a task')
      .option('-f, --force', 'Skip confirmation')
      .action(async (taskId, options) => {
        try {
          const id = this.parseTaskId(taskId);
          const task = await this.taskManager.getTask(id);

          if (!task) {
            throw new Error(`Task ${id} not found`);
          }

          if (!options.force) {
            const confirmed = await this.confirmDelete(task);
            if (!confirmed) {
              console.log('Delete cancelled');
              return;
            }
          }

          const deleted = await this.taskManager.deleteTask(id);
          console.log(`Task ${deleted.id} deleted`);
        } catch (error) {
          this.handleError(error);
        }
      });
  }

  parseTaskId(value) {
    const id = Number(value);
    if (!Number.isInteger(id) || id <= 0) {
      throw new Error('Task ID  must be a positive integer');
    }
    return id;
  }

  async confirmDelete(task) {
    if (!input.isTTY) {
      return true;
    }

    const rl = createInterface({ input, output });
    try {
      const answer = await rl.question(`Delete task ${task.id} "${task.title}"? (y/N) `);
      return ['y', 'yes'].includes(answer.trim().toLowerCase());
    } finally {
      rl.close();
    }
  }

  handleError(error) {
    console.error(`Error: ${error.message}`);
    process.exitCode = 1;
  }

  async run(args) {
    await this.program.parseAsync(args, { from: 'user' });
  }
}
