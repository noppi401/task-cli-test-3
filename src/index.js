#!/usr/bin/env node

const { run } = require('./lib/cli');

process.exitCode = run(process.argv.slice(2));
