import { test, expect } from "@jest/globals";
import { spawnSync } from "node:child_process";
import { mkdtempSync, rmSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "..");
const cliPath = path.join(projectRoot, "index.js");

function withTempCli(callback) {
  const dir = mkdtempSync(path.join(tmpdir(), "task-cli-e2e-"));
  const store = path.join(dir, "tasks.json");
  const run = (args) =>
    spawnSync(process.execPath, [cliPath, ...args], {
      cwd: projectRoot,
      env: { ...process.env, TASK_CLI_STORAGE_FILE: store },
      encoding: "utf8",
    });

  try {
    return callback({ run, store });
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

test("index.js persists CRUD across separate CLI invocations", () => {
  withTempCli(({ run, store }) => {
    expect(run(["add", "Buy milk"]).status).toBe(0);
    const listed = run(["list", "--filter", "pending"]);
    expect(listed.status).toBe(0);
    expect(listed.stdout).toContain("Buy milk");
    expect(run(["complete", "1"]).status).toBe(0);
    expect(JSON.parse(readFileSync(store, "utf8")).tasks[0].status).toBe("completed");
    expect(run(["delete", "1"]).status).toBe(0);
    expect(JSON.parse(readFileSync(store, "utf8")).tasks).toHaveLength(0);
  });
});

test("index.js rejects unknown commands", () => {
  withTempCli(({ run }) => {
    const result = run(["archive", "1"]);
    expect(result.status).not.toBe(0);
    expect(result.stderr).toMatch(/unknown command|invalid command/i);
  });
});

test("index.js rejects add without a task description", () => {
  withTempCli(({ run }) => {
    const result = run(["add"]);
    expect(result.status).not.toBe(0);
    expect(result.stderr).toMatch(/task description/i);
  });
});

test("index.js rejects invalid task IDs for mutating commands", () => {
  withTempCli(({ run }) => {
    const completeResult = run(["complete", "not-a-number"]);
    expect(completeResult.status).not.toBe(0);
    expect(completeResult.stderr).toMatch(/invalid task id|task id|failed to complete/i);

    const deleteResult = run(["delete", "not-a-number"]);
    expect(deleteResult.status).not.toBe(0);
    expect(deleteResult.stderr).toMatch(/invalid task id|task id|failed to delete/i);
  });
});

test("index.js rejects invalid list filters", () => {
  withTempCli(({ run }) => {
    const result = run(["list", "--filter", "archived"]);
    expect(result.status).not.toBe(0);
    expect(result.stderr).toMatch(/invalid filter|filter/i);
  });
});
