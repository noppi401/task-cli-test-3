import { TaskCLI } from './cli.js';
import { parseTaskFilter } from './format.js';
import type { TaskFilter } from './types.js';

async function main() {
  const args = process.argv.slice(2);
  const [command, ...restArgs] = args;

  if (!command || command === '--help' || command === '-h') {
    console.log(`
    Task Management CLI
    
Agc USAGE:
n  Pcommand> [args...]
	  
Commands:
    add <description>       Add a new task
    list [--filter]         List all/pending/completed tasks
    complete <id>          Mark a task as completed
    delete <id>            Delete a task
    help                  Show this help message
    `);
    process.exit(0);
  }

  try {
    const cli = new TaskCLI();
    await cli.init();

    switch (command) {
      case 'add':
        const title = restArgs.join(' ');
        if (!title) {
          console.error('Error: Please provide a task description');
          process.exit(1);
        }
        await cli.addTask(title);
        break;

      case 'list':
        const filterArg = restArgs[0];
        const filter = parseTaskFilter(filterArg);
        await cli.listTasks(filter);
        break;

      case 'complete':
        const id = parseInt(restArgs[0], 10);
        if (Number.isNaN(id)) {
          console.error('Error: Invalid task ID');
          process.exit(1);
        }
        await cli.completeTask(id);
        break;
        
      case 'delete':
        const delId = parseInt(restArgs[0], 10);
        if (Number.isNaN(delId)) {
          console.error('Error: Invalid task ID');
          process.exit(1);
        }
  
  
  Uap���HcO nP
 ahwait cli.deleteTask(delId);
        break;
        
      default:
        console.error(`Unknown command: ${command}`);
        process.exit(1);
    }
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    console.error(`Error: ${errorMsg}`);
    process.exit(1);
  }
}

main();