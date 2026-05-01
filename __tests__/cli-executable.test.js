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

test("index.js persists CRUD across separate CLI invocations", () => {
  const dir = mkdtempSync(path.join(tmpdir(), "task-cli-e2e-"));
  const store = path.join(dir, "tasks.json");
  const run = (args) =>
    spawnSync(process.execPath, [cliPath, ...args], {
      cwd: projectRoot,
      env: { ...process.env, TASK_CLI_STORAGE_FILE: store },
      encoding: "utf8",
    });

  try {
    expect(run(["add", "Buy milk"]).status).toBe(0);
    const listed = run(["list", "--filter", "pending"]);
    expect(listed.status).toBe(0);
    expect(listed.stdout).toContain("Buy milk");
    expect(run(["complete", "1"]).status).toBe(0);
    expect(JSON.parse(readFileSync(store, "utf8")).tasks[0].status).toBe("completed");
    expect(run(["delete", "1"]).status).toBe(0);
    expect(JSON.parse(readFileSync(store, "utf8")).tasks).toHaveLength(0);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});
