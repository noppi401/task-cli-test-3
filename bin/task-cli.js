#!/usr/bin/env node
import { createProgram } from '../lib/cli.js';

createProgram().parseAsync(process.argv).catch((error) => {
  const message = error instanceof Error ? error.message : 'An unexpected error occurred.';
  console.error(`Error: ${message}`);
  process.exitCode = 1;
});
