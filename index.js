#!/usr/bin/env node

const { run } = require('./lib/cli');

run(process.argv)
  .then(exitCode => {
    process.exitCode = exitCode;
  })
  .catch(error => {
    console.error(`Error: ${error.message}`);
    process.exitCode = 1;
  });
