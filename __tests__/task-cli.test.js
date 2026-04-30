import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, test } from "@jest/globals";
import { runCli } from "../lib/cli.js";
import { TaskStore, NotFoundError, TaskStoreError, ValidationError } from "../lib/tasks.js";

let tempDir;
let taskFile;

beforeEach(async () => {
  tempDir = await mkdtemp(path.join(os.tmpdir(), "task-cli-"));
  taskFile = path.join(tempDir, "tasks.json");
});

afterEach(async () => {
  await rm(tempDir, { recursive: true, force: true });
});

function streams() {
  let stdout = "";
  let stderr = "";
  return {
    stdout: { write: (chunk) => { stdout += chunk; } },
    stderr: { write: (chunk) => { stderr += chunk; } },
    result: () => ({ stdout, stderr })
  };
}

async function cli(args) {
  const s = streams();
  const exitCode = await runCli(args, { filePath: taskFile, stdout: s.stdout, stderr: s.stderr });
  return { exitCode, ...s.result() };
}

describe("TaskStore CRUD", () => {
  test("adds tasks with incremental IDs and persists to JSON", async () => {
    const store = new TaskStore(taskFile);
    const first = await store.addTask("Buy groceries", new Date("2024-01-01T10:00:00.000Z"));
    const second = await store.addTask("Write tests", new Date("2024-01-02T10:00:00.000Z"));

    expect(first).toMatchObject({ id: 1, title: "Buy groceries", status: "pending" });
    expect(second.id).toBe(2);

    const persisted = JSON.parse(await readFile(taskFile, "utf8"));
    expect(persisted.tasks).toHaveLength(2);
    expect(persisted.tasks[0].title).toBe("Buy groceries");
  });

  test("lists all, pending, and completed tasks", async () => {
    const store = new TaskStore(taskFile);
    const pending = await store.addTask("Pending");
    const completed = await store.addTask("Completed");
    await store.completeTask(completed.id, new Date("2024-01-03T10:00:00.000Z"));

    await expect(store.listTasks().resolves.toHaveLength(2);
    await expect(store.listTasks("pending")).resolves.toEqual([expect.objectContaining({ id: pending.id })]);
    await expect(store.listTasks("completed")).resolves.toEqual([expect.objectContaining({ id: completed.id, status: "completed" })]);
  });

  test("marks a task complete and records timestamp", async () => {
    const store = new TaskStore(taskFile);
    const task = await store.addTask("Ship code");
    const done = await store.completeTask(task.id, new Date("2024-01-04T12:00:00.000Z"));

    expect(done).toMatchObject({status: "completed", completedAt: "2024-01-04T12:00:00.000Z"});
  });

  test("deletes a task and persists the remaining tasks", async () => {
    const store = new TaskStore(taskFile);
    const keep = await store.addTask("Keep");
    const remove = await store.addTask("Remove");

    await expect(store.deleteTask(remove.id)).resolves.toBe(remove.id);
    await expect(store.listTasks()).resolves.toEqual([expect.objectContaining({ id: keep.id, title: "Keep" })]);
  });
});

describe("TaskStore persistence and errors", () => {
  test("loads tasks persisted by a previous store instance", async () => {
    const store = new TaskStore(taskFile);
    await store.addTask("Persisted");
    await expect(new TaskStore(taskFile).listTasks()).resolves.toEqual([expect.objectContaining({ title: "Persisted" })]);
  });

  test("creates a missing storage file", async () => {
    const store = new TaskStore(taskFile);
    await expect(store.listTasks()).resolves.toEqual([]);
    await expect(readFile(taskFile, "utf8")).resolves.toContain("\"tasks\"");
  });

  test("rejects invalid JSON without overwriting it", async () => {
    await writeFile(taskFile, "{ broken", "utf8");
    const store = new TaskStore(taskFile);
    await expect(store.listTasks()).rejects.toThrow(TaskStoreError);
    await expect(readFile(taskFile, "utf8")).resolves.toBe("{ broken");
  });

  test("rejects missing and invalid identifiers", async () => {
    const store = new TaskStore(taskFile);
    await store.addTask("Only");
    await expect(store.completeTask(999)).rejects.toThrow(NotFoundError);
    await expect(store.deleteTask(999)).rejects.toThrow(NotFoundError);
    await expect(store.completeTask("bad")).rejects.toThrow(ValidationError);
  });
});

describe("CLI integration", () => {
  test("covers add, list, complete, filtered list, and delete", async () => {
    await expect(cli(["add", "Buy groceries"])).resolves.toMatchObject({ exitCode: 0, stdout: "Task added (ID: 1)\n", stderr: "" });
    await cli(["add", "Write tests"]);

    const all = await cli(["list"]);
    expect(all.stdout).toContain("Buy groceries");
    expect(all.stdout).toContain(
      "Write tests"
    );

    await expect(cli(["complete", "1"])).resolves.toMatchObject({ exitCode: 0, stdout: "Task 1 marked as complete\n" });

    const completed = await cli(["list", "--filter", "completed"]);
    expect(completed.stdout).toContain("Buy groceries");
    expect(completed.stdout).not.toContain("Write tests");

    await expect(cli(["delete", "2"])).resolves.toMatchObject({ exitCode: 0, stdout: "Task 2 deleted\n" });

    const persisted = JSON.parse(await readFile(taskFile, "utf8"));
    expect(persisted.tasks).toEqual([expect.objectContaining({ id: 1, status: "completed" })]);
  });

  test("validates commands and produces clear errors", async () => {
    await expect(cli(["archive", "1"])).resolves.toMatchObject({ exitCode: 1, stderr: "Error: Unknown command: archive\n" });
    await expect(cli(["add"])).resolves.toMatchObject({exitCode: 1, stderr: "Error: Task description is required\n"});
    await expect(cli(["complete", "nan"])).resolves.toMatchObject({exitCode: 1, stderr: "Error: Task ID must be a positive integer\n"});
    await expect(cli(["list", "--filter", "archived"])).resolves.toMatchObject({exitCode: 1, stderr: "Error: Filter must be one of: all, pending, completed\n"});
  });
});
