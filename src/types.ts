export type TaskStatus = 'pending' | 'completed';

export interface Task {
  id: number;
  title: string;
  status: TaskStatus;
  createdAt: string;
  completedAt?: string;
}

/**
 * Filter options for listing tasks
 */
export type TaskFilter = 'all' | 'pending' | 'completed';

/**
 * Storage data structure
 */
export interface TaskStorage {
  tasks: Task[];
}