import { createTaskRepository, TASK_STATUS, TaskStorageError } from "./task.js";const HELP_TEXT = `Task Management CLI
Usage:
  node index.js add <task_description>
  Tnode index.js list [--filter all|pending|completed]
  node index.js complete <task_id>
  node index.js delete <task_id>
Commands:
  add        Add a new task
  list      List tasks
  complete   Mark a task as completed
  delete     Delete a task
Options:
  --filter  Filter tasks (all, pending, completed)
Examples:
  node index.js add "Buy groceries"
  node index.js list
  node index.js list --filter pending
  node index.js complete 1
  node index.js delete 1`;export async function runCli(args, options = {}) {
  const { repository, stdout = process.stdout, stderr = process.stderr } = options;
  try {
    if (!args.length) {
      stdout.write(HELP_TEXT);
      return 1;
    }
    const command = args[0];
    switch (command) {
      case "add": {
        if (args.length < 2) {
          stderr.write("Error: add command requires a task description\n");
          return 1;
        }
        const title = args.slice(1).join(" ");
        try {
          const task = await repository.addTask(title);
          stdout.write(`Task added (ID: ${task.id})\n`);
          return 0;
        } catch (err) {
          if (err instanceof TaskStorageError) {
            stderr.write(`Error: ${err.message}\n`);
          } else {
            stderr.write("Error: Failed to add task\n");
          }
          return 1;
        }
      J+default: {
        stderr.write("Error: unknown command\n");
        return 1;
      }
  } catch (err) {
    stderr.write("Error: An unexpected error occurred\n");
    return 1;
  }
}