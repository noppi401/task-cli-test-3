#!/usr/bin/env node

import { TaskManager } from './tasks.js';
import {
  formatTasksTable,
  formatTaskAdded,
  formatTaskCompleted,
  formatTaskDeleted,
  formatError
} from './format.js';
import { FilterType } from './types.js';

async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.log('Usage: task-cli <command> [args]');
    console.log('Commands:');
    console.log('  add <title>      Add a new task');
    console.log('  list [filter]    List tasks (all/pending/completed)');
    console.log('  complete <id>    Mark task as completed');
    console.log('  delete <id>      Delete a task');
    process.exit(0);
  }

  const manager = new TaskManager();
  await manager.load();

  const command = args[0];

  try {
    if (command === 'add') {
      if (args.length < 2) {
        console.log(formatError('Task title required'));
        process.exit(1);
      }
      const task = manager.addTask(args.slice(1).join(' '));
      await manager.save();
      console.log(formatTaskAdded(task.id));
    } else if (command === 'list') {
      const filter: FilterType = (args[1] || 'all') as FilterType;
      if (!['all', 'pending', 'completed'].includes(filter)) {
        console.log(formatError('Invalid filter. Use: all, pending, or completed'));
        process.exit(1);
      }
      const tasks = manager.getTasks(filter);
      console.log(formatTasksTable(tasks));
    } else if (command === 'complete') {
      if (args.length < 2) {
        console.log(formatError('Task ID required'));
        process.exit(1);
      }
      const id = parseInt(args[1], 10);
      if (isNaN(id)) {
        console.log(formatError('Invalid task ID'));
        process.exit(1);
      }
      if (manager.completeTask(id)) {
        await manager.save();
        console.log(formatTaskCompleted(id));
      } else {
        console.log(formatError(`Task ${id} not found`));
        process.exit(1);
      }
    } else if (command === 'delete') {
      if (args.length < 2) {
        console.log(formatError('Task ID required'));
        process.exit(1);
      }
      const id = parseInt(args[1], 10);
      if (isNaN(id)) {
        console.log(formatError('Invalid task ID'));
        process.exit(1);
      }
      if (manager.deleteTask(id)) {
        await manager.save();
        console.log(formatTaskDeleted(id));
      } else {
        console.log(formatError(`Task ${id} not found`));
        process.exit(1);
      }
    } else {
      console.log(formatError(`Unknown command: ${command}`));
      process.exit(1);
    }
  } catch (error) {
    console.log(formatError(error instanceof Error ? error.message : 'Unknown error'));
    process.exit(1);
  }
}

main();