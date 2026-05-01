#!/usr/bin/env node
import { CLI } from './lib/cli.js';
import { resolve } from 'node:path';

function printTasks(tasks) {
  console.log('\nID  Title                    Status     Created');
  console.log('--  -----                   ------     -------');
  tasks.forEach((task) => {
    const createdDate = new Date(task.createdAt).toLocaleDateString();
    const title = task.title.length > 24 ? `${task.title.substring(0, 21)}...` : task.title;
    console.log(`${String(task.id).padEnd(3)} ${title.padEnd(24)} ${task.status.padEnd(10)} ${createdDate}`);
  });
}

async function main() {
  const args = process.argv.slice(2);
  const command = args[0] || 'help';
  const commandArgs = args.slice(1);
  const cli = new CLI(resolve('./tasks.json'));

  const initResult = await cli.taskManager.initialize();
  if (!initResult.success) {
    console.error(`Error: ${initResult.error}`);
    process.exit(1);
  }

  const response = await cli.execute(command, commandArgs);
  if (response.success) {
    if (response.tasks) {
      if (response.tasks.length === 0) console.log(response.message || 'No tasks found');
      else printTasks(response.tasks);
    } else if (response.message) {
      console.log(response.message);
    }
    return;
  }

  console.error(`Error: ${response.error}`);
  process.exit(1);
}

main().catch((error) => {
  console.error(`Error: ${error.message}`);
  process.exit(1);
});
