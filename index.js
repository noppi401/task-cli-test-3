import { createProgram } from './lib/cli.js';

const program = createProgram();
program.parse(process.argv);

if (process.argv.length === 2) {
  program.help();
}
