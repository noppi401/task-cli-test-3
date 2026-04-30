import { afterEach, beforeEach, describe, expect, jest, test } from "@jest/globals";
import { mkdtemp, rm, readFile, writeFile } from "node:fs/promises";
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
    expect(second).toMatchObject({ id: 2, title: "Write tests", status: "pending" });
    expect(new Date(first.createdAt).toISOString()).toBe(first.createdAt);
    await expect(readStoredTasks()).resolves.toEqual(expect.arrayContaining([
      expect.objectContaining({ id: 1, title: "Buy groceries", status: "pending" }),
      expect.objectContaining({ id: 2, title: "Write tests", status: "pending" })
    ]));
  });

  test("lists all, pending, and completed tasks from the real store", async () => {
    const repository = createRepository();
    const pending = await repository.addTask("Pending task");
    const completed = await repository.addTask("Completed task");
    await repository.completeTask(completed.id);

    await expect(repository.listTasks()).resolves.toHaveLength(2);
    await expect(repository.listTasks("all")).resolves.toHaveLength(2);
    await expect(repository.listTasks("pending")).resolves.toEqual([
      expect.objectContaining({ id: pending.id, title: "Pending task", status: "pending" })
    ]);
    await expect(repository.listTasks("completed")).resolves.toEqual([
      expect.objectContaining({ id: completed.id, title: "Completed task", status: "completed" })
    ]);
  });

  test("completes and deletes tasks and persists those changes between instances", async () => {
    const firstRepository = createRepository();
    const keep = await firstRepository.addTask("Keep me");
    const remove = await firstRepository.addTask("Remove me");

    const completed = await firstRepository.completeTask(keep.id);
    const deleted = await firstRepository.deleteTask(remove.id);

    expect(completed).toMatchObject({ id: keep.id, status: "completed" });
    expect(new Date(completed.completedAt).toISOString()).toBe(completed.completedAt);
    expect(deleted).toMatchObject({id: remove.id, title: "Remove me" });

    const secondRepository = createRepository();
    await expect(secondRepository.listTasks("all")).resolves.toEqual([
      expect.objectContaining({ id: keep.id, title: "Keep me", status: "completed" })
    ]);
  });
});

describe("TaskRepository error scenarios", () => {
  test("rejects empty task titles and invalid filters", async () => {
    const repository = createRepository();

    await expect(repository.addTask("   ")).rejects.toThrow(/description|required|title|empty/i);
    await expect(repository.listTasks("archived")).rejects.toThrow(/filter|invalid/i);
  });

  test("rejects invalid and missing task ids", async () => {
    const repository = createRepository();
    await repository.addTask("Existing task");

    await expect(repository.completeTask(999)).rejects.toThrow(/not found/i);
    await expect(repository.deleteTask(999)).rejects.toThrow(/not found/i);
    await expect(repository.completeTask(0)).rejects.toThrow(/id|positive|not found/i);
    await expect(repository.deleteTask(Number.NaN)).rejects.toThrow(/id|positive|not found/i);
  });

  test("rejects malformed storage files instead of silently losing data", async () => {
    await writeFile(storagePath, "{ not valid json", "utf8");
    const repository = createRepository();

    await expect(repository.listTasks()).rejects.toThrow(/load|read|json|storage/i);
  });

  test("surfaces write failures when persistence cannot be saved", async () => {
    const blockingFile = path.join(tempDir, "not-a-directory");
    await writeFile(blockingFile, "blocks mkdir", "utf8");
    const repository = createRepository(path.join(blockingFile, "tasks.json"));

    await expect(repository.addTask("Cannot persist")).rejects.toThrow(/save|write|storage|mkdir|directory/i);
  });
});

describe("CLI command handling", () => {
  test("runs add, list, complete, and delete against injected persistent storage", async () => {
    const repository = createRepository();
    const stdout = memoryStream();
    const stderr = memoryStream();

    await expect(runCli(["add", "Buy", "milk"], { repository, stdout, stderr })).resolves.toBe(0);
    expect(stdout.output).toContain("Task added (ID: 1)");

    stdout.output = "";
    await expect(runCli(["list", "--filter", "pending"], { repository, stdout, stderr })).resolves.toBe(0);
    expect(stdout.output).toContain("Buy milk");
    expect(stdout.output).toContain("pending");

    stdout.output = "";
    await expect(runCli(["complete", "1"], { repository, stdout, stderr })).resolves.toBe(0);
    expect(stdout.output).toContain("Task 1 marked as complete");

    stdout.output = "";
    await expect(runCli(["delete", "1"], { repository, stdout, stderr })).resolves.toBe(0);
    expect(stdout.output).toContain("Task 1 deleted");
    await expect(repository.listTasks()).resolves.toHaveLength(0);
    expect(stderr.output).toBe("");
  });

  test("validates commands, required arguments, task ids, and list filters", async () => {
    const repository = createRepository();
    const stdout = memoryStream();
    const stderr = memoryStream();

    await expect(runCli(["unknown"], { repository, stdout, stderr })).resolves.toBe(1);
    await expect(runCli(["add", "   "], { repository, stdout, stderr })).resolves.toBe(1);
    await expect(runCli(["complete", "abc"], { repository, stdout, stderr })).resolves.toBe(1);
    await expect(runCli(["delete", "0"], { repository, stdout, stderr })).resolves.toBe(1);
    await expect(runCli(["list", "--filter", "archived"], { repository, stdout, stderr })).resolves.toBe(1);

    expect(stderr.output).toMatch(/unknown command/i);
    expect(stderr.output).toMatch(/description|required|title|empty/i);
    expect(stderr.output).toMatch(/positive integer|task id/i);
    expect(stderr.output).toMatch(/filter|invalid/i);
  });

  test("prints help with a non-zero exit code when no command is provided", async () => {
    const stdout = memoryStream();
    const stderr = memoryStream();

    await expect(runCli([], { repository: createRepository(), stdout, stderr })).resolves.toBe(1);
    expect(stdout.output).toMatch(/usage:/i);
    expect(stdout.output).toMatch(/add <task_description>/i);
    expect(stderr.output).toBe("");
  });
});
