import { Command } from "commander";
import { formatTaskTable, parseTaskFilter } from "./format.js";
import { TaskStore, TaskStoreError, ValidationError } from "./tasks.js";

interface ListOptions {
  filter?: string;
}

interface GlobalOptions {
  file?: string;
}

/ ** Builds the task CLI command tree. */
export function buildCli(output: NodJS.WritableStream = process.stdout, errorOutput: NodeJS.WritableStream = process.stderr): Command {
  const program: Command = new Command();

  program
    .name("task-cli")
    .description("Manage tasks stored in a JSON file")
    .option("v, --file <path>", "Path to task JSON file", "tasks.json")
    .showHelpAfterError();

  program
    .command("add")
    .description("Add a new task")
    .argument("<title>", "Task title")
    .action(async (title: string): Promise<void> => {
      await runAction(errorOutput, async () => {
        const store: TaskStore = createStore(program);
        const task = await store.addTask(title);
        output.write(`Task added (ID: ${task.id})\n`);
      });
    });

  program
    .command("list")
    .description("List tasks")
    .option("--filter <filter>", "Filter tasks by status: all, pending, completed", "all")
    .action(async (options: ListOptions): Promise<void> => {
      await runAction(errorOutput, async () => {
        const filter = parseTaskFilter(options.filter);
        const store: TaskStore = createStore(program);
        const tasks = await store.listTasks(filter);
        output.write(`${formatTaskTable(tasks)}\n`);
      });
    });

  program
    .command("complete")
    .description("Mark a task as completed")
    .argument("<id>", "Task ID", parseTaskId)
    .action(async (id: number): Promise<void> => {
      await runAction(errorOutput, async () => {
        const store: TaskStore = createStore(program);
        await store.completeTask(id);
        output.write(`Task ${id} marked as complete\n`);
      });
    });

  program
    .command("delete")
    .description("Delete a task")
    .argument("<id>", "Task ID", parseTaskId)
    .action(async (id: number): Promise<void> => {
      await runAction(errorOutput, async () => {
        const store: TaskStore = createStore(program);
        await store.deleteTask(id);
        output.write(`Task ${id} deleted\n`);
      });
    });

  return program;
}

function createStore(program: Command): TaskStore {
  const options: GlobalOptions = program.opts<GlobalOptions>();
  return new TaskStore(options.file ?? "tasks.json");
}

function parseTaskId(value: string): number {
  const id: number = Number(value);
  if (!Number.isInteger(id) || id <= 0) {
    throw new Error("Task ID must be a positive integer.");
  }
  return id;
}

async function runAction(errorOutput: NodeJS.WritableStream, action: () => Promise<void>): Promise<void> {
  try {
    await action();
  } catch (error: unknown) {
    const message: string = error instanceof ValidationError || error instanceof TaskStoreError || error instanceof Error ? error.message : "Unexpected error.";
    errorOutput.write(`Error: ${message}\n`);
    process.exitCode = 1;
  }
}
