#!/usr/bin/env node
import { CLI } from './lib/cli.js';

const cli = new CLI();
await cli.run(process.argv.slice(2));