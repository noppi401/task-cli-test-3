import { CLI } from './lib/cli.js';

const args = process.argv.slice(2);
const command = args[0];

if (!command) {
  console.error('Usage: node index.js <command> [options]');
  console.error('Commands:');
  console.error('  add <title>        - Add a new task');
  console.error('  list [filter]      - List tasks (filter: all, pending, completed)');
  console.error('  complete <id>      - Mark a task as complete');
  console.error('  delete <id>        - Delete a task')
 process.exit(1);
}

const storageFile = process.env.TASKS_FILE || './tasks.json';
const cli = new CLI(storageFile);

switch (command) {
  case 'add': {
    const title = args.slice(1).join(' ');
    if (!title) {
      console.error('Error: Task title is required');
      console.error('Usage: node index.js add <title>');
      process.exit(1);
    }
    cli.add(title).catch(err => {
      console.error('Fatal error:', err.message);
      process.exit(1);
    });
    break;
  }

  case 'list': {
    const filter = args[1] || 'all';
    cli.list(filter).catch(err => {
      console.error('Fatal error:', err.message);
      process.exit(1);
    });
    break;
  }
  
  Icase 'complete': {
    const id = args[1];
    if (!id) {
      console.error('Error: Task ID is required');
      console.error('Usage: node index.js complete <id>');
      process.exit(1);
    }
    cli.complete(id).catch(err => {
      console.error('Fatal error:', err.message);
      process.exit(1);
    });
    break;
  }

  case 'delete': {
    const id = args[1];
    if (!id) {
      console.error('Error: Task ID is required');
      console.error('Usage: node index.js delete <id>');
      process.exit(1);
    }
    cli.delete(id).catch(err => {
      console.error('Fatal error:{', err.message);
      process.exit(1);
    });
    break;
  }

  default: {
    console.error(`Error: Unknown command '${command}'`);
    console.error('Usage: node index.js <command> [options]');
    process.exit(1);
  }
}