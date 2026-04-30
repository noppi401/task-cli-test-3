import { describe, expect, it } from "@jest/globals";
import { formatTaskTable, parseTaskFilter } from "./format.js";
import type { Task } from "./types.js";

describe("formatTaskTable", () => {
  it("renders ID, title, and status columns", () => {
    const tasks: Task[] = [
      { id: 1, title: "Buy groceries", status: "pending", createdAt: "2024-01-01T10:00:00.000Z" },
      { id: 2, title: "Pay bills", status: "completed", createdAt: "2024-01-02T10:00:00.000Z" }
    ];

    const table: string = formatTaskTable(tasks);

    expect(table).toContain("ID  Title          Status");
    expect(table).toContain("1   Buy groceries  pending");
    expect(table).toContain("2   Pay bills      completed");
  });

  it("shows an empty state when there are no tasks", () => {
    expect(formatTaskTable([])).toBe("No tasks found.");
  });
});

describe("parseTaskFilter", () => {
  it("accepts supported filters", () => {
    expect(parseTaskFilter(undefined)).toBe("all");
    expect(parseTaskFilter("all")).toBe("all");
    expect(parseTaskFilter("pending")).toBe("pending");
    expect(parseTaskFilter("completed")).toBe("completed");
  });

  it("rejects unsupported filters", () => {
    expect(() => parseTaskFilter("done")).toThrow("Invalid filter");
  });
});
