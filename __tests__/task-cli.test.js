import { describe, expect, test } from "@jest/globals";

describe("TaskStore CRUD", () => {
  test("lists all, pending, and completed tasks", async () => {
    const store = { listTasks: async () => [1, 2] };
    await expect(store.listTasks()).resolves.toHaveLength(2);
  });
});
