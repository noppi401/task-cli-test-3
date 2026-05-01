import { mkdtemp, stat, unlink } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { describe, expect, it } from "@jest/globals";
import { TaskStore } from "./tasks.js";

describe("TaskStore", () => {
  it("adds tasks and filters listed tasks by status", async () => {
    const dir: string = await mkdtemp(path.join(os.tmpdir(), "task-cli-"));
    const file: string = path.join(dir, "tasks.json");
    const store: TaskStore = new TaskStore(file);

    const firstTask = await store.addTask("Write tests");
    const secondTask = await store.addTask("Ship CLI");
    await store.completeTask(secondTask.id);

    const allTasks = await store.listTasks("all");
    const pendingTasks = await store.listTasks("pending");
    const completedTasks = await store.listTasks("completed");

    expect(allTasks).toHaveLength(2);
    expect(pendingTasks).toEqual([expect.objectContaining({ id: firstTask.id, status: "pending" })]);
    expect(completedTasks).toEqual([expect.objectContaining({ id: secondTask.id, status: "completed" })]);

    await unlink(file);
  });
});
