import { afterEach, beforeEach, describe, expect, test } from "@jest/globals";
import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { TaskRepository, TaskStorageError } from "../lib/task.js";
import { runCli } from "../lib/cli.js";

let tempDir;
let storagePath;

function memoryStream() {
  return {
    output: "",
    write(chunk) {
      this.output += chunk;
    }
  };
}

beforeEach(async () => {
  tempDir = await mkdtemp(path.join(tmpdir(), "task-cli-storage-errors-"));
  storagePath = path.join(tempDir, "tasks.json");
});

afterEach(async () => {
  await rm(tempDir, { recursive: true, force: true });
});

describe("TaskRepository storage error handling", () => {
  test("starts with an empty task list when the storage file is missing", async () => {
    const repository = new TaskRepository({ storagePath });
    await expect(repository.listTasks()).resolves.toEqual([]);
  });

  test("throws TaskStorageError when the storage file contains invalid JSON", async () => {
    await writeFile(storagePath, "{ invalid json", "utf8");
    const repository = new TaskRepository({ storagePath });
    await expect(repository.listTasks()).rejects.toThrow(TaskStorageError);
    await expect(repository.listTasks()).rejects.toThrow("Failed to parse tasks file");
  });

  test("throws TaskStorageError when persisted JSON has an invalid shape", async () => {
    await writeFile(storagePath, JSON.stringify({ tasks: {} }), "utf8");
    const repository = new TaskRepository({ storagePath });
    await expect(repository.listTasks()).rejects.toThrow(TaskStorageError);
  });

  test("surfaces write failures as TaskStorageError", async () => {
    const directoryPath = path.join(tempDir, "as-directory.json");
    await mkdir(directoryPath);
    const repository = new TaskRepository({ storagePath: directoryPath });
    await expect(repository.addTask("Cannot save here")).rejects.toThrow(TaskStorageError);
  });

  test("CLi reports storage errors on stderr with failure status", async () => {
    await writeFile(storagePath, "not json", "utf8");
    const repository = new TaskRepository({ storagePath });
    const stdout = memoryStream();
    const stderr = memoryStream();

    const status = await runCli(["list"], { repository, stdout, stderr });

    expect(status).toBe(1);
    expect(stdout.output).toBe("");
    expect(stderr.output).toContain("Failed to parse tasks file");
  });
});
