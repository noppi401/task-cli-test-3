#!/usr/bin/env node
import { TaskCLI } from './cli.js';
import { parseTaskFilter } from './format.js';

function printHelp(): void {
  console.log(`Task Management CLI

Usage:
  task-cli add <description>
  task-cli list [all|pending|completed|--filter=<filter>]
  task-cli complete <id>
  task-cli delete <id>
  task-cli help

Commands:
  add <description>       Add a new task
  list                    List tasks, optionally filtered by status
  complete <id>           Mark a task as completed
  delete <id>             Delete a task
  help                   Show this help message`);
}

function parseId(value: string | undefined): number {
  const id = Number.parseInt(value ?? '', 10);
  if (!Number.isInteger(id) || id <= 0) {
    throw new Error('Invalid task ID');
  }
  return id;
}

async function main(): Promise<void> {
  const [command, ...args] = process.argv.slice(2);

  if (!command || command === '--help' || command === '-h' || command === 'help') {
    printHelp();
    return;
  }

  const cli = new TaskCLI();
  await cli.init();

  switch (command) {
    case 'add': {
      const title = args.join(' ');
      if (!title.trim()) {
        throw new Error('Please provide a task description');
      }
      await cli.addTask(title);
      return;
    }

    case 'list': {
      const filterArg = args[0] === '--filter' ? args[1] : args[0];
      await cli.listTasks(parseTaskFilter(filterArg));
      return;
    }

    case 'complete':
      await cli.completeTask(parseId(args[0]));
      return;

    case 'delete':
      await cli.deleteTask(parseId(args[0]));
      return;

    default:
      throw new Error(`Unknown command: ${command}`);
  }
}

main().catch((err: unknown) => {
  const message = err instanceof Error ? err.message : String(err);
  console.error(`Error: ${message}`);
  process.exit(1);
});
