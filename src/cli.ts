import { Command } from "commander";
import { formatTaskTable, parseTaskFilter } from "./format.js";
import { TaskStore, TaskStoreError, ValidationError } from "./tasks.js";
import type { TaskFilter } from "./types.js";

interface GlobalOptions {
  file?: string;
}

interface ListOptions {
  filter?: string;
}

function parseTaskId(value: string): number {
  const id: number = Number(value);
  if (!Number.isInteger(id) || id <= 0) {
    throw new ValidationError("Task ID must be a positive integer.");
  }
  return id;
}

function createStore(program: Command): TaskStore {
  const options = program.opts<GlobalOptions>();
  return new TaskStore(options.file);
}

function handleCommandError(error: unknown): void {
  if (error instanceof ValidationError || error instanceof TaskStoreError) {
    console.error(`Error: ${error.message}`);
    process.exitCode = 1;
    return;
  }

  throw error;
}

export function buildCli(): Command {
  const program = new Command();

  program
    .name("task-cli")
    .description("Manage tasks with JSON file persistence")
    .version("1.0.0")
    .option("--file <path>", "path to the JSON task file");

  program
    .command("add")
    .description("Add a new pending task")
    .argument("<title...>", "task title or description")
    .action(async (titleParts: string[]): Promise<void> => {
      try {
        const task = await createStore(program).addTask(titleParts.join(" "));
        console.log(`Task added (ID: ${task.id})`);
      } catch (error: unknown) {
        handleCommandError(error);
      }
    });

  program
    .command("list")
    .description("List tasks")
    .option("-f, --filter <filter>", "filter tasks by status: all, pending, completed", "all")
    .action(async (options: ListOptions): Promise<void> => {
      try {
        const filter: TaskFilter = parseTaskFilter(options.filter);
        const tasks = await createStore(program).listTasks(filter);
        console.log(formatTaskTable(tasks));
      } catch (error: unknown) {
        handleCommandError(error);
      }
    });

  program
    .command("complete")
    .description("Mark a task as completed")
    .argument("<id>", "task ID")
    .action(async (idValue: string): Promise<void> => {
      try {
        const id: number = parseTaskId(idValue);
        const task = await createStore(program).completeTask(id);
        console.log(`Task ${task.id} marked as complete`);
      } catch (error: unknown) {
        handleCommandError(error);
      }
    });

  program
    .command("delete")
    .description("Delete a task")
    .argument("<id>", "task ID")
    .action(async (idValue: string): Promise<void> => {
      try {
        const id: number = parseTaskId(idValue);
        const task = await createStore(program).deleteTask(id);
        console.log(`Task ${task.id} deleted`);
      } catch (error: unknown) {
        handleCommandError(error);
      }
    });

  return program;
}
