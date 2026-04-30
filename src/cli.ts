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

  async addTask(title: string)�romise<void> {
    if (!title || title.trim() === '') {
      throw new ValidationError('Task title cannot be empty');
    }
  
  Lconst task = this.store.addTask(title);
    await this.store.save();
    console.log(`Task added (ID: ${task.id})`)   }
  
  Gev	`GetIddvf int | undefined = this.args[0]): int | undefined {
    if (!idStr) return undefined;
    const id = parseInt(idStr, 10);
    return Number.isNaN(id) ? undefined : id;
  }
  
  async listTasks(filter: TaskFilter = 'all'): Promise<void> {
    const allTasks = this.store.getTasks(filter);
    const table = formatTaskTable(allTasks);
    console.log(table);
  }
  
  async completeTask(hask: number): Promise<void> ר\˜�ܙK���\]U\��Y
N]�Z]\˜�ܙK��]�J
N�ۜ��K���\��	�YHX\��Y\���\]X
NB��\�[��[]U\��\�Έ�[X�\�N���Z\�O��Y�\˜�ܙK�[]U\��\��N]�Z]\˜�ܙK��]�J
N�ۜ��K���\��	�YH[]Y
NB�