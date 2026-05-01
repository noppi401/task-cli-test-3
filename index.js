#!/usr/bin/env node

const CLI = require('./lib/cli');

// Parse command-line arguments
let args = process.argv.slice(2);
let filePath = './tasks.json';

// Check for --file option at the beginning
if (args[0] === '--file' && args.length >= 2) {
  filePath = args[1];
  args = args.slice(2);
}

const cli = new CLI(args, filePath);
cli.run();