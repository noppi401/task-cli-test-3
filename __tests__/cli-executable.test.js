import { afterEach, beforeEach, describe, expect, test } from "@jest/globals";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { spawn } from "node:child_process";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const cliPath = path.join(repoRoot, "index.js");
let tempDir;
let storagePath;

function runExecutable(args) {
  return new Promise((resolve) => {
    const child = spawn(process.execPath, [cliPath, ...args], {
      cwd: repoRoot,
      env: { ...process.env, TASK_CLI_STORAGE_FILE: storagePath },
      stdio: ["ignore", "pipe", "pipe"]
    });

    let stdout = "";
    let stderr = "";
    child.stdout.on("data", chunk => { stdout += chunk.toString(); });
    child.stderr.on("data", chunk => { stderr += chunk.toString(); });
    child.on("close", code => resolve({ code, stdout, stderr }));
  });
}

async function readTasks() {
  const raw = await readFile(storagePath, "utf8");
  return JSON.parse(raw).tasks;
}

beforeEach(async () => {
  tempDir = await mkdtemp(path.join(tmpdir(), "task-cli-e2e-"));
  storagePath = path.join(tempDir, "tasks.json");
});

afterEach(async () => {
  await rm(tempDir, { recursive: true, force: true });
});

describe("CLI executable integration", () => {
  test("executes CRUD commands and persists data across invocations", async () => {
    const add = await runExecutable(["add", "Buy groceries"]);
    expect(add.code).toBe(0);
    expect(add.stdout).toContain("Task added");
    expect(add.stderr).toBe("");

    const addSecond = await runExecutable(["add", "Write tests"]);
    expect(addSecond.code).toBe(0);

    const list = await runExecutable(["list"]);
    expect(list.code).toBe(0);
    expect(list.stdout).toContain("Buy groceries");
    expect(list.stdout).toContain("Write tests");

    const complete = await runExecutable(["complete", "1"]);
    expect(complete.code).toBe(0);
    expect(complete.stdout).toContain("marked as complete");

    const tasks = await readTasks();
    expect(tasks).toEqual(expect.arrayContaining([
      expect.objectContaining({ id: 1, title: "Buy groceries", status: "completed" }),
      expect.objectContaining({ id: 2, title: "Write tests", status: "pending" })
    ]));

    const listCompleted = await runExecutable(["list", "--filter", "completed"]);
    expect(listCompleted.code).toBe(0);
    expect(listCompleted.stdout).toContain("Buy groceries");
    expect(listCompleted.stdout).not.toContain("Write tests");

    const deleted = await runExecutable(["delete", "1"]);
    expect(deleted.code).toBe(0);
    expect(deleted.stdout).toContain("Task 1 deleted");

    expect(await readTasks()).toEqual([expect.objectContaining({ id: 2, title: "Write tests" })]);
  });

  test("returns non-zero exit codes and stderr for command validation", async () => {
    await expect(runExecutable(["add"])).resolves.toMatchObject({ code: 1, stderr: expect.stringContaining("requires a task description") });
    await expect(runExecutable(["complete", "not-a-id"])).resolves.toMatchObject({ code: 1, stderr: expect.stringContaining("Invalid task ID") });
    await expect(runExecutable(["unknown"])).resolves.toMatchObject({ code: 1, stderr: expect.stringContaining("unknown command") });
  });
});
