import fs from 'fs/promises';
import path from 'path';
import type { Task, TaskStatus, TaskStorage } from './types.js';

export class TaskStoreError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'TaskStoreError';
  }
}

export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

/**
 * Task Store for data persistence
 */
export class TaskStore {
  private filePath: string;
  private tasks: Task[] = [];

  constructor(filePath?: string) {
    this.filePath = filePath || path.join(process.cwd(), 'tasks.json');
  }

  async load(): Promise<void> {
    try {
      const data = await fs.readFile(this.filePath, 'utf-8');
      const parsed: TaskStorage = JSON.parse(data);
      this.tasks = parsed.tasks || [];
    } catch (err) {
      if ((err as any).code === 'ENOENTB�( 
�\˝\���H�NH[�H����]�\���ܙQ\��܊�Z[Y��Y\��Έ	�\��X
NB�B�B��\�[���]�J
N���Z\�O��Y��H�ۜ�]N�\���ܘY�HH�\��Έ\˝\���N]�Z]�˝ܚ]Q�[J\˙�[T]��Ӌ���[��Y�J]K�[�JNH�]�
\��H����]�\���ܙQ\��܊�Z[Y��]�H\��Έ	�\��X
NB�B���]\����[\��\���]\�	�[	�H	�[	�N�\���HY�
�[\�OOH	�[	�H�]\��\˝\���B��6
�\�ǹ뛗\��˙�[\�O���]\�OOH�[\�NB��Y\��]N���[��N�\���ۜ�YHX]�X^
���\˝\��˛X\
O��Y
K
H
�N�ۜ�\�Έ\��HY�]K��]\Έ	�[�[����ܙX]Y]��]�]J
K��T����[��
K�N\˝\��˜\�
\��N�]\��\��B����\]U\��Y��[X�\�N���Y�ۜ�\��H\˝\��˙�[�
O��YOOHY
NY�
]\��H����]��[Y][ۑ\��܊\���]Q	�YH����[�
NB�\�˜�]\�H	���\]Y	�\�˘��\]Y]H�]�]J
K��T����[��
NB��[]U\��Y��[X�\�N���Y�ۜ�[�^H\˝\��˙�[�[�^
O��YOOHY
NY�
[�^OOHLJH����]��[Y][ۑ\��܊\���]Q	�YH����[�
NB�\˝\��˜�X�J[�^JNB��]\�؞ZY
Y��[X�\�N�\��[�Y�[�Y�]\��\˝\��˙�[�
O��YOOHY
NB��Q�][\���
N�\���H�]\��\˝\���B�