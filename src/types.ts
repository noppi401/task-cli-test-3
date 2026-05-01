export interface Task {
  id: number;
  title: string;
  status: 'pending' | 'completed';
  createdAt: string;
}

export interface TaskStore {
  tasks: Task[];
}

export type FilterType = 'all' | 'pending' | 'completed';