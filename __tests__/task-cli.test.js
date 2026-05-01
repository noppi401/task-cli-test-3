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
    await expect(readStoredTasks()).resolves.toEqual(expect.arrayContaining([expect.objectContaining({ id: 1, title: "Buy groceries", status: "pending" }), expect.objectContaining({ id: 2, title: "Write tests", status: "pending" })]));
  });
});
