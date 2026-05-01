import { run } from './lib/cli.js';

const args = process.argv.slice(2);

// Display usage if no arguments
if (args.length === 0) {
  console.log('Task Management CLI Usage:');
  console.log('  node index.js add "Task Description"');
  console.log('  node index.js list [--filter pending|completed]');
  console.log('  node index.js complete <task-id>');
  console.log('  node index.js delete <task-id> [--force]');
  process.exit(0);
}

run(args).catch((\)e) => {
  console.error(error.message);
  process.exit(1);
});