#!/usr/bin/env node
import { mkdir, readFile, rename, unlink, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { Command } from 'commander';

export type TaskStatus = 'pending' | 'completed';
export type TaskFilter = 'all' | TaskStatus;

export interface Task {
  id: number;
  title: string;
  status: TaskStatus;
  createdAt: string;
  completedAt?: string;
}

export interface TaskDatabase {
  tasks: Task[];
}

export class TaskCliError extends Error {
  public constructor(message: string) {
    super(message);
    this.name = 'TaskCliError';
  }
}

class StorageError extends TaskCliError {
  public constructor(message: string) {
    super(message);
    this.name = 'StorageError';
  }
}

class ValidationError extends TaskCliError {
  public constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

class NotFoundError extends TaskCliError {
  public constructor(message: string) {
    super(message);
    this.name = 'NotFoundError';
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isIsoDate(value: string): boolean {
  const parsed = Date.parse(value);
  return Number.isFinite(parsed) && new Date(parsed).toISOString() === value;
}

function isTask(value: unknown): value is Task {
  if (!isRecord(value)) {
    return false;
  }

  const completedAt = value.completedAt;
  return (
    Number.isSafeInteger(value.id) &&
    Number(value.id) > 0 &&
    typeof value.title === 'string' &&
    value.title.trim().length > 0 &&
    (value.status === 'pending' || value.status === 'completed') &&
    typeof value.createdAt === 'string' &&
    isIsoDate(value.createdAt) &&
    (completedAt === undefined ||
      (typeof completedAt === 'string' && isIsoDate(completedAt)))
  );
}

export function parseTaskDatabase(value: unknown): TaskDatabase {
  if (!isRecord(value) || !Array.isArray(value.tasks)) {
    throw new StorageError('Task file must contain an object with a tasks array.');
  }

  const ids = new Set<number>();
  const tasks: Task[] = [];
  for (const task of value.tasks) {
    if (!isTask(task)) {
      throw new StorageError('Task file contains an invalid task entry.');
    }
    if (ids.has(task.id)) {
      throw new StorageError(`Task file contains duplicate task id: ${task.id}.`);
    }
    ids.add(task.id);
    tasks.push({ ...task });
  }

  return { tasks };
}

class JsonTaskStorage {
  private readonly filePath: string;

  public constructor(filePath: string) {
    this.filePath = path.resolve(filePath);
  }

  public async load(): Promise<TaskDatabase> {
    try {
      const raw = await readFile(this.filePath, 'utf8');
      return parseTaskDatabase(JSON.parse(raw) as unknown);
    } catch (error: unknown) {
      if (isNodeError(error) && error.code === 'ENOENT') {
        const empty: TaskDatabase = { tasks: [] };
        await this.save(empty);
        return empty;
      }
      if (error instanceof SyntaxError) {
        throw new StorageError(`Task file is not valid JSON: ${this.filePath}`);
      }
      if (error instanceof StorageError) {
        throw error;
      }
      throw new StorageError(`Unable to read task file: ${getErrorMessage(error)}`);
    }
  }

  public async save(database: TaskDatabase): Promise<void> {
    const validDatabase = parseTaskDatabase(database);
    const directory = path.dirname(this.filePath);
    const tempPath = `${this.filePath}.${process.pid}.${Date.now()}.tmp`;
    const serialized = `${JSON.stringify(validDatabase, null, 2)}\n`;

    try {
      await mkdir(directory, { recursive: true });
      await writeFile(tempPath, serialized, { encoding: 'utf8', flag: 'wx' });
      await rename(tempPath, this.filePath);
    } catch (error: unknown) {
      await unlink(tempPath).catch((): void => undefined);
      throw new StorageError(`Unable to write task file: ${getErrorMessage(error)}`);
    }
  }
}

export class TaskService {
  private readonly storage: JsonTaskStorage;
  private readonly now: () => Date;

  public constructor(storage: JsonTaskStorage, now: () => Date = (): Date => new Date()) {
    this.storage = storage;
    this.now = now;
  }

  public async addTask(title: string): Promise<Task> {
    const normalizedTitle = title.trim();
    if (normalizedTitle.length === 0) {
      throw new ValidationError('Task description cannot be empty.');
    }

    const database = await this.storage.load();
    const task: Task = {
      id: nextId(database.tasks),
      title: normalizedTitle,
      status: 'pending',
      createdAt: this.now().toISOString()
    };

    database.tasks.push(task);
    await this.storage.save(database);
    return task;
  }

  public async listTasks(filter: TaskFilter = 'all'): Promise<Task[]> {
    if (!isTaskFilter(filter)) {
      throw new ValidationError('Filter must be one of: all, pending, completed.');
    }

    const database = await this.storage.load();
    const tasks = filter === 'all' ? database.tasks : database.tasks.filter((task) => task.status === filter);
    return [...tasks].sort((a, b) => a.id - b.id);
  }

  public async completeTask(id: number): Promise<Task> {
    assertValidId(id);
    const database = await this.storage.load();
    const task = database.tasks.find((item) => item.id === id);

    if (task === undefined) {
      throw new NotFoundError(`Task ${id} was not found.`);
    }
    if (task.status === 'completed') {
      throw new ValidationError(`Task ${id} is already completed.`);
    }

    task.status = 'completed';
    task.completedAt = this.now().toISOString();
    await this.storage.save(database);
    return task;
  }

  public async deleteTask(id: number): Promise<Task> {
    assertValidId(id);
    const database = await this.storage.load();
    const index = database.tasks.findIndex((task) => task.id === id);

    if (index === -1) {
      throw new NotFoundError(`Task ${id} was not found.`);
    }

    const [removed] = database.tasks.splice(index, 1);
    await this.storage.save(database);
    return removed;
  }
}

export function parseTaskId(rawId: string): number {
  const id = Number(rawId);
  if (!Number.isSafeInteger(id) || id <= 0) {
    throw new ValidationError('Task ID must be a positive integer.');
  }
  return id;
}

function nextId(tasks: Task[]): number {
  return tasks.reduce((max, task) => Math.max(max, task.id), 0) + 1;
}

function assertValidId(id: number): void {
  if (!Number.isSafeInteger(id) || id <= 0) {
    throw new ValidationError('Task ID must be a positive integer.');
  }
}

function isTaskFilter(value: string): value is TaskFilter {
  return value === 'all' ||�[YHOOH	�[�[����[YHOOH	���\]Y	�B���[��[ۈ\ӛ�Q\��܊\��܎�[�ۛ�ۊN�\��܈\���R�ˑ\����^�\[ۈ�]\��\��܈[��[��[و\��܈	��	���I�[�\��܎B���[��[ۈ�]\��ܓY\��Y�J\��܎�[�ۛ�ۊN���[���]\��\��܈[��[��[و\��܈�\��܋�Y\��Y�H���[��\��܊NB��^ܝ�[��[ۈ�ܛX]\��X�J\��Έ\���JN���[��Y�
\��˛[��OOH
H�]\��	ӛ�\�����[����B���ۜ�XY\��H��Q	�	�]I�	��]\��	�ܙX]Y]	�N�ۜ�����H\��˛X\

\��HO����[��\�˚Y
K\�˝]K\�˜�]\�\�˘ܙX]Y]JN�ۜ��Y�HXY\�˛X\

XY\�[�^
HO�X]�X^
XY\��[��������˛X\

���HO�����[�^O˛[����
JJN�ۜ��ܛX]���H
��Έ��[���JN���[��O���˛X\

�[[�^
HO��[�Y[�
�Y��[�^H���[�[��
JK���[�	�	�K��[Q[�

N��]\��	ٛܛX]���XY\��_W�ܛ��˛X\
�ܛX]���K���[�	���_W�B���[��[ۈܙX]T�\��X�J�[N���[��N�\���\��X�H�]\���]�\���\��X�J�]���ە\���ܘY�J�[JJNB��^ܝ�[��[ۈܙX]T��ܘ[J
N���[X[��ۜ���ܘ[HH�]���[X[�

N���ܘ[B���[YJ	�\��X�I�B��\�ܚ\[ۊ	�X[�Y�H\����]��ӈ�[H\��\�[��K��B���\��[ۊ	�K��	�B���[ۊ	�Y�KY�[H]��	Ҕ�ӈ�ܘY�H�[H]	�	ˋ�\��˚��ۉ�N��ܘ[B����[X[�
	�Y	�B��\�ܚ\[ۊ	�YH�]�\���B��\��[Y[�
	�\�ܚ\[ۋ�����	�\��\�ܚ\[ۉ�B��X�[ۊ\�[��
\�ܚ\[۔\�Έ��[���JHO�]�Z][�Q\��ܜ�\�[��

HO��ۜ�\��H]�Z]ܙX]T�\��X�J��ܘ[K���
K��[JK�Y\��\�ܚ\[۔\�˚��[�	�	�JN���\�˜��]�ܚ]J\��YY
Q�	�\�˚YJW�
NJNJN���ܘ[B����[X[�
	�\�	�B��\�ܚ\[ۊ	�\�\����B���[ۊ	�KY�[\�[[�[����\]Y��	ٚ[\�\����H�]\��	�[	�B��X�[ۊ\�[��
�[ۜΈ��[\��\�њ[\�JHO�]�Z][�Q\��ܜ�\�[��

HO��ۜ�\���H]�Z]ܙX]T�\��X�J��ܘ[K���
K��[JK�\�\����[ۜ˙�[\�N���\�˜��]�ܚ]J�ܛX]\��X�J\���JNJNJN���ܘ[B����[X[�
	���\]I�B��\�ܚ\[ۊ	�X\��H\��\���\]Y	�B��\��[Y[�
	�Y��	�\��Y	�B��X�[ۊ\�[��
�]�Y���[��HO�]�Z][�Q\��ܜ�\�[��

HO��ۜ�\��H]�Z]ܙX]T�\��X�J��ܘ[K���
K��[JK���\]U\��\��U\��Y
�]�Y
JN���\�˜��]�ܚ]J\��	�\�˚YHX\��Y\���\]W�
NJNJN���ܘ[B����[X[�
	�[]I�B��\�ܚ\[ۊ	�[]HH\��\�X[�[�I�B��\��[Y[�
	�Y��	�\��Y	�B��X�[ۊ\�[��
�]�Y���[��HO�]�Z][�Q\��ܜ�\�[��

HO��ۜ�\��H]�Z]ܙX]T�\��X�J��ܘ[K���
K��[JK�[]U\��\��U\��Y
�]�Y
JN���\�˜��]�ܚ]J\��	�\�˚YH[]Y�
NJNJN��]\����ܘ[NB��\�[���[��[ۈ[�Q\��ܜ�X�[ێ�

HO���Z\�O��Y�N���Z\�O��Y��H]�Z]X�[ۊ
NH�]�
\��܎�[�ۛ�ۊH���\�˜�\���ܚ]J\��܎�	��]\��ܓY\��Y�J\��܊_W�
N���\�˙^]��HH\��܈[��[��[و\���Q\��܈�H��B�B��Y�
[\ܝ�Y]K�\�OOH�[N�������\�˘\�ݖ�W_X
H]�Z]ܙX]T��ܘ[J
K�\��P\�[�����\�˘\�݊NB