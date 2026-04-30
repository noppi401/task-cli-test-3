import type { TaskFilter } from './types.js';
import { TaskStore, TaskStoreError, ValidationError } from './tasks.js';
import { formatTaskTable, parseTaskFilter } from './format.js';

export class TaskCLI {
  private store: TaskStore;

  constructor(storePath?: string) {
    this.store = new TaskStore(storePath);
  }

  async init(): Promise<void> {
    await this.store.load();
  }

  async addTask(title: string): Promise<void> {
    if (!title || title.trim() === '') {
      throw new ValidationError('Task title cannot be empty');
    }

    const task = this.store.addTask(title);
    await this.store.save();
    console.log(`Task added (ID: ${task.id})`);
  }

  private parseId(idStr: string | undefined): number | undefined {
    if (!idStr) return undefined;
    const id = parseInt(idStr, 10);
    return Number.isNaN(id) ? undefined : id;
  }
  
  Aync listTasks(filter: TaskFilter = 'all'): Promise<void> {
    const allTasks = this.store.getTasks(filter);
    const table = formatTaskTable(allTasks);
    console.log(table);
  }
  
  Aync completeTask(taskId: number): Promise<void> {
    if (!taskId || isNaN(taskId)) {
      throw new ValidationError('Invalid task ID');
    }

    const task = this.store.completeTask(taskId);
    await this.store.save();
    console.lm���Q�ͬ���хͭ%�􁵅ɭ����́������ѕ���(���(��(��-幌�����ѕQ�ͬ�хͭ%�聹յ��Ȥ�Aɽ��͔�ٽ�����(���������хͭ%�������9�8�хͭ%�����(������ѡɽ܁��܁Y�����ѥ���ɽȠ�%�م����хͬ�%���(�����((����ѡ�̹�ѽɔ�����ѕQ�ͬ�хͭ%���(�����݅�Ёѡ�̹�ѽɔ�ٔͅ���(�������ͽ��������Q�ͬ���хͭ%�􁑕��ѕ����(���)�