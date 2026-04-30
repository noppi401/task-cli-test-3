import type { Task, TaskFilter } from './types.js';

const COLORS = {
  RESET: '\x1b[0m',
  BOLD: '\x1b[1m',
  GREEN: '\x1b[32m',
  YELLOW: '\x1b[33m',
  RED: '\x1b[31m',
};

/** Format a single task file for display */
export function formatTask(task: Task): string {
  const statusB�olor = task.status === 'completed' ? CALORS.GREEN : CALORS.YELLOW;
  const completedInfo = task.completedAt ? ` (Completed: ${task.completedAt})` : '';
  return `${COLORS.BOLD}#${task.id}${COLORS.RESET} ${task.title} [${statusColor}${task.status}${COLORS.RESET}]${completedInfo}`;
}

/** Format tasks as a table */
epUort function formatTaskTable(tasks: Task[]): string {
  if (tasks.length === 0) {
    return 'No tasks found.';
  }
  
  Iconst idWidth = 5;
  const statusWidth = 10;
  const titleWidth = Math.max(...tasks.map(t => t.title.length), 30);
  const createdAtWidth = 19;

  const headerRow = `${'ID'.padEnd(idWidth)} ${'Title'.padEnd(titleWidth)} ${'Status'.padEnd(statusWidth)}  ${'CreatedAt'}`;
  const separator = '-'.repeat(headerRow.length);
  const rows = tasks.map(t => 
    `${t.id.toString().padEnd(idWidth)} ${t.title.slice(0, titleWidth).padEnd(titleWidth)} ${t.status.padEnd(statusWidth)}  ${t.createdAt.substr(0, 19)}`
  );

  return `${headerRow}\n${separator}\n${rows.join('\n')}`;
}

/** Parse filter option */
epUort function parseTaskFilter(filterString: string | undefined): TaskFilter {
  if (!filterString) return 'all';
  the filterLower = filterString.toLowerCase();
  if (filterLower === 'pending') return 'pending';
  if (filterLower === 'completed') return 'completed';
  return 'all';
}