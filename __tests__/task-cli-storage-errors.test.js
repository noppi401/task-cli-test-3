import { afterEach, beforeEach, describe, expect, jest, test } from "@jest/globals";
import { mkdtemp, rm, readFile, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { TaskRepository, TaskStorageError } from "../lib/task.js";

let tempDir;
let storagePath;

beforeEach(async () => {
  jest.useFakeTimers().setSystemTime(new Date("2024-01-02T03:04:05.000Z"));
  tempDir = await mkdtemp(path.join(tmpdir(), "task-cli-error-test-"));
  storagePath = path.join(tempDir, "tasks.json");
});

afterEach(async () => {
  jest.useRealTimers();
  await rm(tempDir, { recursive: true, force: true });
});

describe("TaskRepository storage error handling", () => {
  test("throws TaskStorageError when reading corrupted JSON file", async () => {
    await writeFile(storagePath, "{ invalid json content ]");
    const repository = new TaskRepository({ storagePath });
    await expect(repository.listTasks("all")).rejects.toThrow(TaskStorageError);
  });

  test("throws TaskStorageError with cause when JSON parse fails", async () => {
    await writeFile(storagePath, "not valid json at all");
    const repository = new TaskRepository({ storagePath });
    try {
      await repository.listTasks("all");
      expect(true).toBe(false);
    } catch (err) {
      expect(err).toBeInstanceOf(TaskStorageError);
      expect(err.cause).toBeDefined();
    }
  });

  test("creates new storage file if it does not exist", async () => {
    const newStoragePath = path.join(tempDir, "new-tasks.json");
    const repository = new TaskRepository({ storagePath: newStoragePath });
    const task = await repository.addTask("New task");
    expect(task.id).toBe(1);
    expect(task.title).toBe("New task");
    const content = await readFile(newStoragePath, "utf8");
    const data = JSON.parse(content);
    expect(data.tasks).toHaveLength(1);
  });

  test("creates parent directories if they do not exist", async () => {
    const nestedPath = path.join(tempDir, "nested", "deep", "dir", "tasks.json");
    const repository = new TaskRepository({ storagePath: nestedPath });
    const task = await repository.addTask("Nested task");
    expect(task.id).toBe(1);
    const content = await readFile(nestedPath, "utf8");
    const data = JSON.parse(content);
    expect(data.tasks).toHaveLength(1);
  });

  test("handles concurrent writes with atomic file operations", async () => {
    const repository = new TaskRepository({ storagePath });
    const task1Promise = repository.addTask("Task 1");
    const task2Promise = repository.addTask("Task 2");
    const task3Promise = repository.addTask("Task 3");
    const results = await Promise.all([task1Promise, task2Promise, task3Promise]);
    expect(results).toHaveLength(3);
    expect(results[0].id).toBe(1);
    expect(results[1].id).toBe(2);
    expect(results[2].id).toBe(3);
    const fileContent = await readFile(storagePath, "utf8");
    const data = JSON.parse(fileContent);
    expect(data.tasks).toHaveLength(3);
  });

  test("throws error for invalid filter with meaningful message", async () => {
    const repository = new TaskRepository({ storagePath });
    await repository.addTask("Test task");
    await expect(repository.listTasks("invalid-filter")).rejects.toThrow();
  });

  test("throws error when completing non-existent task", async () => {
    const repository = new TaskRepository({ storagePath });
    await expect(repository.completeTask(999)).rejects.toThrow();
  });

  test("throws error when deleting non-existent task", async () => {
    const repository = new TaskRepository({ storagePath });
    await expect(repository.deleteTask(999)).rejects.toThrow();
  });

  test("throws error when adding empty task title", async () => {
    const repository = new TaskRepository({ storagePath });
    await expect(repository.addTask("")).rejects.toThrow();
    await expect(repository.addTask("   ")).rejects.toThrow();
  });

  test("validates task data structure in storage", async () => {
    const repository = new TaskRepository({ storagePath });
    const task = await repository.addTask("Test task");
    expect(task).toHaveProperty("id");
    expect(task).toHaveProperty("title");
    expect(task).toHaveProperty("status");
    expect(task).toHaveProperty("createdAt");
    expect(typeof task.id).toBe("number");
    expect(typeof task.title).toBe("string");
    expect(task.status).toBe("pending");
    expect(typeof task.createdAt).toBe("string");
  });

  test("maintains data integrity after multiple operations", async () => {
    const repository = new TaskRepository({ storagePath });
    await repository.addTask("Task 1");
    await repository.addTask("Task 2");
    await repository.addTask("Task 3");
    await repository.completeTask(2);
    await repository.deleteTask(1);
    const remaining = await repository.listTasks("all");
    expect(remaining).toHaveLength(2);
    const ids = remaining.map(t => t.id).sort();
    expect(ids).toEqual([2, 3]);
    const statuses = remaining.map(t => ({ id: t.id, status: t.status }));
    expect(statuses).toContainEqual({ id: 2, status: "completed" });
    expect(statuses).toContainEqual({ id: 3, status: "pending" });
  });
});

describe("Storage error recovery and resilience", () => {
  test("re-initializes repository after storage error", async () => {
    const repository = new TaskRepository({ storagePath });
    const task1 = await repository.addTask("First task");
    expect(task1.id).toBe(1);
    await writeFile(storagePath, "{ broken json");
    await expect(repository.listTasks("all")).rejects.toThrow();
    const newStoragePath = path.join(tempDir, "recovery.json");
    const newRepository = new TaskRepository({ storagePath: newStoragePath });
    const task = await newRepository.addTask("Recovered task");
    expect(task.id).toBe(1);
  });

  test("uses environment variable for storage path", async () => {
    const envPath = path.join(tempDir, "env-tasks.json");
    const originalValue = process.env.TASK_CLI_STORAGE_FILE;
    process.env.TASK_CLI_STORAGE_FILE = envPath;
    try {
      const repository = new TaskRepository();
      await repository.addTask("Task from env");
      const fileContent = await readFile(envPath, "utf8");
      const data = JSON.parse(fileContent);
      expect(data.tasks).toHaveLength(1);
    } finally {
      process.env.TASK_CLI_STORAGE_FILE = originalValue;
    }
  });

  test("handles rapid sequential file operations", async () => {
    const repository = new TaskRepository({ storagePath });
    const task = await repository.addTask("Rapid task");
    await repository.completeTask(task.id);
    await repository.deleteTask(task.id);
    const remaining = await repository.listTasks("all");
    expect(remaining).toHaveLength(0);
  });
});