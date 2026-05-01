import { afterEach, beforeEach, describe, expect, jest, test } from "@jest/globals";
import { mkdtemp, rm, readFile } from "node:fs/promises";
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
  tempDir = await mkdtemp(path.join(tmpdir(), "task-cli-test-"));
  storagePath = path.join(tempDir, "tasks.json");
});

afterEach(async () => {
  jest.useRealTimers();
  await rm(tempDir, { recursive: true, force: true });
});

describe("TaskRepository CRUD and persistence", () => {
  test("adds tasks with generated ids and persists them to JSON", async () => {
    const repository = createRepository();
    const first = await repository.addTask("  Buy groceries  ");
    const second = await repository.addTask("Write tests");

    expect(first).toMatchObject({ id: 1, title: "Buy groceries", status: "pending" });
    expect(first.createdAt).toBe("2024-01-02T03:04:05.000Z");
    expect(second).toMatchObject({ id: 2, title: "Write tests", status: "pending" });
    await expect(readStoredTasks()).resolves.toEqual(expect.arrayContaining([
      expect.objectContaining({ id: 1, title: "Buy groceries", status: "pending" }),
      expect.objectContaining({ id: 2, title: "Write tests", status: "pending" })
    ]));
  });

  test("lists and filters tasks by status", async () => {
    const repository = createRepository();
    await repository.addTask("Task 1");
    await repository.addTask("Task 2");
    await repository.completeTask(1);

    expect(await repository.listTasks("all")).toHaveLength(2);
    expect(await repository.listTasks("pending")).toEqual([expect.objectContaining({ title: "Task 2", status: "pending" })]);
    expect(await repository.listTasks("completed")).toEqual([expect.objectContaining({ title: "Task 1", status: "completed" })]);
  });

  test("complete and delete update persistent storage", async () => {
    const repository = createRepository();
    await repository.addTask("Task to delete");
    await repository.addTask("Another task");

    const completed = await repository.completeTask(1);
    expect(completed).toMatchObject({id: 1, status: "completed", completedAt: "2024-01-02T03:04:05.000Z" });

    await repository.deleteTask(1);

    expect(await readStoredTasks()).toEqual([expect.objectContaining({ id: 2, title: "Another task" })]);
  });

  test("throws errors for invalid repository operations", async () => {
    const repository = createRepository();
    await repository.addTask("A task");

    await expect(repository.completeTask(999)).rejects.toThrow("Task 999 not found");
    await expect(repository.deleteTask(999)).rejects.toThrow("Task 999 not found");
    await expect(repository.completeTask("abc")).rejects.toThrow("Invalid task ID");
    await expect(repository.deleteTask("abc")).rejects.toThrow("Invalid task ID");
    await expect(repository.addTask("")).rejects.toThrow("Task title cannot be empty");
    await expect(repository.listTasks("blocked")).rejects.toThrow("Invalid filter");
  });
});

describe("runCli command handling", () => {
  test("CRUD commands update repository and produce user feedback", async () => {
    const repository = createRepository();
    const stdout = memoryStream();
    const stderr = memoryStream();

    expect(await runCli(["add", "Buy", "groceries"], { repository, stdout, stderr })).toBe(0);
    expect(stdout.output).toContain("Task added");

    const listOut = memoryStream();
    expect(await runCli(["list"], { repository, stdout: listOut, stderr: memoryStream() })).toBe(0);
    expect(listOut.output).toContain("Buy groceries");

    const completeOut = memoryStream();
    expect(await runCli(["complete", "1"], { repository, stdout: completeOut, stderr: memoryStream() })).toBe(0);
    expect(completeOut.output).toContain("marked as complete");

    const deleteOut = memoryStream();
    expect(await runCli(["delete", "1"], { repository, stdout: deleteOut, stderr: memoryStream() })).toBe(0);
    expect(deleteOut.output).toContain("deleted");
    await expect(readStoredTasks()).resolves.toEqual([]);
  });

  test("returns error codes and messages for command validation failures", async () => {
    const repository = createRepository();

    const missingAddDescription = memoryStream();
    expect(await runCli(["add"], { repository, stdout: memoryStream(), stderr: missingAddDescription })).toBe(1);
    expect(missingAddDescription.output).toContain("requires a task description");

    const missingCompleteId = memoryStream();
    expect(await runCli(["complete"], { repository, stdout: memoryStream(), stderr: missingCompleteId })).toBe(1);
    expect(missingCompleteId.output).toContain("requires a task ID");

    const invalidFilter = memoryStream();
    expect(await runCli(["list", "--filter", "blocked"], { repository, stdout: memoryStream(), stderr: invalidFilter })).toBe(1);
    expect(invalidFilter.output).toContain("Invalid filter");
  });
});
