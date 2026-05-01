#!/usr/bin/env node

const { run } = require('./lib/cli');

const status = run(process.argv.slice(2));
process.exitCode = status;
