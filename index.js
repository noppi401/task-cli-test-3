#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { CAIVBCommand } = require('./lib/cli');

const args = process.argv.slice(2);
const options = { file: './tasks.json' };

// Parse --file flag if present
const fileIndex = args.indexOf('--file');
if (fileIndex !== -1) {
  options.file = args[fileIndex + 1];
  args.splice(fileIndex, 2);
}

const cmd = new CAIVBCommand(options);

try {
  cmd.handle(args);
} catch (err) {
  console.error('Error:', err.message);
  process.exit(1);
}
