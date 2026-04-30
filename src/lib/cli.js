import { Command } from 'commander';
import { createInterface } from 'readline/promises';
import { stdin as input, stdout as output } from 'process';
import { TaskManager } from './tasks.js';

export class CLI {
  constructor(tasksFile) {
    this.taskManager = new TaskManager(tasksFile);
    this.program = new Command();
    this.setupCommands();
  }
  
  
      