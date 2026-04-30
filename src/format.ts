import type { Task, TaskFilter } from "./types.js";

/** Parses and validates the list command filter option. */
export function parseTaskFilter(value: string | undefined): TaskFilter {
  if (value === undefined || value === "all") {
    return "all";
  }

  if (value === "pending" || value === "completed") {
    return value;
  }

  throw new Error("Invalid filter. Use one of: all, pending, completed.");
}

/** Formats tasks as a stable plain-text table with ID, title, and status columns. */
export function formatTaskTable(tasks: readonly Task[]): string {
  if (tasks.length === 0) {
    return "No tasks found.";
  }

  const headers: string[] = ["ID", "Title", "Status"];
  const rows: string[][] = tasks.map((task: Task) => [String(task.id), task.title, task.status]);
  const widths: number[] = headers.map((header: string, columnIndex: number) => {
    const cellWidths: number[] = rows.map((row: string[]) => row[columnIndex].length);
    return Math.max(header.length, ...cellWidths);
  });

  const formatRow = (cells: readonly string[]): string => cells.map((cell: string, index: number) => cell.padEnd(widths[index])).join("  ");
  const separator: string = widths.map((width: number) => "-".repeat(width)).join("  ");

  return [formatRow(headers), separator, ...rows.map(formatRow)].join("\n");
}
