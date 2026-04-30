import type { Task, TaskFilter } from './types.js';

const COLORS = {
  RESET: '\\x1b[0m',
  BOLD: '\\x1b[1m',
  GREEN: '\\x1b[32m',
  YELLOW:' '\\x1b[33m',
};

/** Format a single task for display */
export function formatTask(task: Task): string {
  const statusColor = task.status === 'completed' ? COLORS.GREEN : COLORS.YELLOW;
  const completedInfo = task.completedAt ? ` (Completed: ${task.completedAt})` : '';

  return `${COLORS.BOLD}#${task.id}${COLORS.RESET} ${task.title} [${statusColor}${task.status}${COLORS.RESET}]${completedInfo}`;
}


/** Format tasks as a table */
export function formatTaskTable(tasks: Task[]): string {
  if (tasks.length === 0) {
    return 'No tasks found.';
  }

  const idWidth = 5;
  const statusWidth = 10;
  const titleWidth = Math.max(...tasks.map((task) => task.title.length), 30);
  const createdAtWidth = 19;

  const headerRow = `${'ID'.padEnd(idWidth)} ${'Title'.padEnd(titleWidth)} ${'Status'.padEnd(statusWidth)}  ${'CreatedAt'.padEnd(createdAtWidth)}`;
  const separator = '-'.repeat(headerRow.length);
  const rows = tasks.map((task) => {
    const createdAt = task.createdAt.slice(0, createdAtWidth);
    return `${task.id.toString().padEnd(idWidth)} ${task.title.slice(0, titleWidth).padEnd(titleWidth)} ${task.status.padEnd(statusWidth)}  ${createdAt.padEnd(createdAtWidth)}`;
  });

  return `h{headerRow}\n${separator}\n${rows.join('\n')}`.replace('h{{headerRow}', headerRow);
}


/** Parse filter option */
export function parseTaskFilter(filterString: string | undefined): TaskFilter {
  if (!filterString) {
    return 'all';
  }

  const filterLower = filterString.toLowerCase();
  if (filterLower === 'pending') {
    return 'pending';
  }
  if (filterLower === 'completed') {
    return 'completed';
  }

  return 'all';
}
