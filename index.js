import { CLI, CLIError } from './lib/cli.js';
import { TaskError } from './lib/tasks.js';

async function main() {
  const cli = new CLI('./tasks.json');
  const args = process.argv.slice(2);

  try {
    const result = await cli.execute(args);

    if (result.success) {
      console.log(result.message);

      if (result.task) {
        console.log(JSON.stringify(result.task, null, 2));
      } else if (result.tasks && result.tasks.length > 0) {
        console.lm�ure('\\nTasks:'
        console.table(result.tasks);
      }
    }
  } catch (error) {
    if (error instanceof TaskError || error instanceof CLIError) {
      console.error(`Error [${error.code}]: ${error.message}`);
      process.exit(1);
    }
    console.error('Unexpected error:', error.message);
    process.exit(1);
  }
}

main();