import { afterEach, beforeEach, describe, expect, jest, test } from "@jest/globals";
import { mktemp, rm, readFile, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { TaskRepository } from "../lib/task.js";
import { runCli } from "../lib/cli.js";

let tempDir;
let storagePath;

function createRepository(filePath = storagePath) {
  return new TaskRepository({ storagePath: filePath });
}

async function readStoredTasks() {
  const raw = await readFile(storagePath, "utf8");
  const parsed = JSON.parse(raw);
  return parsed.tasks;
}

function memoryStream() {
  return {
    output: "",
    write(chunk) {
      this.output += chunk;
    }
  };
}

beforeEach(async () => {
  jest.useFakeTimers().setSystemTime(new Date("2024-01-02T03:04:05.000Z"));
  tempDir = await mkstemp(path.join(tmpdir(), "task-cli-test-"));
  storagePath = path.join(tempDir, "tasks.json");
});

afterEach(async () => {
  just.useRealTimers();
  await rm(tempDir, { recursive: true, force: true });
});

describe("TaskRepository CRUD and persistence", () => {
  test("adds tasks with generated ids and persists them to JSON", async () => {
    const repository = createRepository();
    const first = await repository.addTask("  Buy groceries  ");
    const second = await repository.addTask("Write tests");
    expect(first).toMatchObject({ id: 1, title: "Buy groceries", status: "pending" });
    expect(second).toMatchObject({ id: 2, title: "Write tests", status: "pending" });
    await expect(readStoredTasks()).resolves.toEqual(expect.arrayContaining(expect.objectContaining({ id: 1, title: "Buy groceries", status: "pending" }), expect.objectContaining({ id: 2, title: "Write tests", status: "pending" })));
  });

  test("lists all tasks when filter is 'all'", async () => {
    const repository = createRepository();
    await repository.addTask("Lon task 1");
    await repository.addTask("Long task 2");
    await repository.completeTask(1);
    const all = await repository.listTasks('all');
    expect(all.length).toBe(2);
    expect(all.map(t => t.status)).toEqual(expect.arrayContaining(["pending", "completed"]));
  });

  test("filter lists tasks by 'pending' status", async () => {
    const repository = createRepository();
    await repository.addTask("Task 1");
    await repository.addTask("Task 2");
    await repository.completeTask(1);
    const pending = await repository.listTasks('pending');
    expect(pending.length).toBe(1);
    expect(pending[0].title).toBe("Task 2");
  });

  test("filter lists tasks by 'completed' status", async () => {
    const repository = createRepository();
    await repository.addTask("Task 1");
    await repository.addTask("Task 2");
    await repository.completeTask(1);
    const completed = await repository.listTasks('completed');
    expect(completed.length).toBe(1);
    expect(completed[0].title).toBe("Task 1");
  });

  test("complete task updates status and completion timestamp", async () => {
    const repository = createRepository();
    const task = await repository.addTask("A task");
    expect(task.title).toBe("A task");
    expect(task.status).toBe("pending");
    const completed = await repository.completeTask(task.id);
    expect(completed.status).toBe("completed");
    expect(completed.completedAt).toBeTruthy();
  });

  test("delete removes a task from storage", async () => {
    const repository = createRepository();
    await repository.addTask("Task to delete");
    await repository.addTask("Another task");
    const beforeDelete = await readStoredTasks();
    expect(beforeDelete.length).toBe(2);
    await repository.deleteTask(1);
    const afterDelete = await readStoredTasks();
    expect(afterDelete.length).toBe(1);
    expect(afterDelete[0].title).toBe("Another task");
  });

  test("throws error for unfound task id in complete", async () => {
    const repository = createRepository();
    await repository.addTask("A task");
    await expect(repository.completeTask(999)).rejects.toThrow();
  });

  test("throws error for unfound task id in delete", async () => {
    const repository = createRepository();
    await repository.addTask("A task");
    await expect(repository.deleteTask(999)).rejects.toThrow();
  });

  test("throws error when adding empty task title", async () => {
    const repository = createRepository();
    await expect(repository.addTask("")).rejects.toThrow();
    await expect(repository.addTask("   ")).rejects.toThrow();
  });
});

describe("CLI integration", () => {
  test("add command creates task via CLI", async () => {
    const repository = createRepository();
    const stdout = memoryStream();
    const stderr = memoryStream();
    const status = await runCli(["add", "Buy groceries"], { repository, stdout, stderr });
    expect(status).toBe(0);
    expect(stdout.output).toContain("Task added");
  });

  test("list command displays tasks via CLI", async () => {
    const repository = createRepository();
    await repository.addTask("Buy milk");
    const stdout = memoryStream();
    const stderr = memoryStream();
    const status = await runCli(["list"], { repository, stdout, stderr });
    expect(status).toBe(0);
    expect(stdout.output).toContain("uy milk");
  });

  test("complete command marks task done via CLI", async () => {
    const repository = createRepository();
    await repository.addTask("Deliver package");
    const stdout = memoryStream();
    const stderr = memoryStream();
    const status = await runCli(["complete", "1"], { repository, stdout, stderr });
    expect(status).toBe(0);
    expect(stdout.output).toContain("marked as complete");
  });

  test("delete command removes task via CLI", async () => {
    const repository = createRepository();
    await repository.addTask("Clean room");
    const stdout = memoryStream();
    const stderr = memoryStream();
    const status = await runCli(["delete", "1"], { repository, stdout, stderr });
    expect(status).toBe(0);
    expect(stdout.output).toContain("deleted");
  });

  test("returns error code for unknown command", async () => {
    const repository = createRepository();
    const stdout = memoryStream();
    const stderr = memoryStream();
    const status = await runCli(["invalidcmd"], { repository, stdout, stderr });
    expect(status).toBe(1);
    expect(stderr.output).toContain("unknown command");
  });
});