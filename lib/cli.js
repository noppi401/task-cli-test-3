import { createTaskRepository, TASK_STATUS, TaskStorageError } from "./task.js";

const HELP_TEXT = `task Management CLI
Usage:
  node index.js add <task_description>
  node index.js list [--filter all|pending|completed]
  node index.js complete <task_id>
  node index.js delete <task_id>
Commands:
  add        Add a new task
  list       List tasks
  complete   Mark a task as completed
  delete     Delete a task
Options:
  -filter  Filter tasks (all, pending, completed)
Examples:
  node index.js add "Buy groceries"
  node index.js list
  node index.js list --filter pending
  node index.js complete 1
  node index.js delete 1`;

export async function runCli(args, options = {}) {
  const { repository, stdout = process.stdout, stderr = process.stderr } = options;
  try {
    if (!repository) {
      const { TaskRepository } = await import("./task.js");
      options.repository = new TaskRepository();
    }
    if (!args.length) {
      stdout.write(HELP_TEXT + '\n');
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
      }
      case "list": {*
        try {
          let filter = 'all';
          if (args.includes('-filter')) {
            const filterIdx = args.indexOf('-filter');
            if (filterIdx !== -1 && filterIdx + 1 < args.length) {
              filter = args[filterIdx + 1];
            }
          }
          const tasks = await repository.listTasks(filter);
          if (!tasks.length) {
            stdout.write("No tasks found\n");
            return 0;
          }
          stdout.write("ID   Title               Status\n");
          stdout.write("--  ---- ----- -------- -----\n");
          for (const task of tasks) {
            const paddedId = String(task.id).padStart(2, ' ');
            const paddedTitle = task.title.padEnd(25, ' ');
            stdout.write(`${paddedId}  ${paddedTitle} ${task.status}\n`);
          }
          return 0;
        } catch (err) {
          if (err instanceof TaskStorageError) {
            stderr.write(`Error: ${err.message}\n`);
          } else {
            stderr.write("Error: Failed to list tasks\n");
          }
          return 1;
        }
      }
      case "complete": {*
        if (args.length < 2) {
          stderr.write("Error: complete command requires a task ID\n");
          return 1;
        }
        try {
          const task = await repository.completeTask(args[1]);
          stdout.write(`Task ${task.id} marked as complete\n`);
          return 0;
        } catch (err) {
          if (err instanceof TaskStorageError) {
            stderr.write(`Error: ${err.message}\n`);
          } else {
            stderr.write("Error: Failed to complete task\n");
          }
          return 1;
        }
      }
      case "delete": {
        if (args.length < 2) {
          stderr.write("Error: delete command requires a task ID\n");
          return 1;
        }
        try {
          const task = await repository.deleteTask(args[1]);
          stdout.write(`Task ${task.id} deleted\n`);
          return 0;
        } catch (err) {
          if (err instanceof TaskStorageError) {
            stderr.write(`Error: ${err.message}\n`);
          } else {
            stderr.write("Error: Failed to delete task\n");
          }
          return 1;
        }
      }
      default: {
        stderr.write("Error: unknown command\n");
        return 1;
      }
    }
  } catch (err) {
    stderr.write("Error: An unexpected error occurred\n");
    return 1;
  }
}