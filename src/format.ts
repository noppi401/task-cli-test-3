import { Task, FilterType } from './types.js';

export function formatTasksTable(tasks: Task[]): string {
  if (tasks.length === 0) {
    return 'No tasks found.';
  }

  const headers = ['ID', 'Title', 'Status', 'Created'];
  const rows = tasks.map(task => [
    task.id.toString(),
    task.title,
    task.status,
    new Date(task.createdAt).toLocaleDateString()
  ]);

  return formatTable(headers, rows);
}

export function formatTable(headers: string[], rows: string[][]): string {
  const colWidths = headers.map((h, i) => 
    Math.max(h.length, ...rows.map(r => r[i]?.length || 0))
  );

  let output = '';
  output += headers.map((h, i) => h.padEnd(colWidths[i])).join('  ') + '\n';
  output += colWidths.map(w => '-'.repeat(w)).join('  ') + '\n';
  output += rows.map(row => 
    row.map((cell, i) => cell.padEnd(colWidths[i])).join('  ')
  ).join('\n');

  return output;
}

export function formatTaskAdded(id: number): string {
  return `Task added (ID: ${id})`;
}

export function formatTaskCompleted(id: number): string {
  return `Task ${id} marked as complete`;
}

export function formatTaskDeleted(id: number): string {
  return `Task ${id} deleted`;
}

export function formatError(message: string): string {
  return `Error: ${message}`;
}