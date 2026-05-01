import { readFileSync, writeFileSync, existsSync } from 'fs';
import { resolve } from 'path';

interface Task {
  id: number;
  title: string;
  status: 'pending' | 'completed';
  createdAt: string;
}

interface TaskData {
  tasks: Task[];
}

const TASKS_FILE = resolve('./tasks.json');

function loadTasks(): TaskData {
  if (!existsSync(TASKS_FILE)) {
    return { tasks: [] };
  }
  try {
    const data = readFileSync(TASKS_FILE, 'utf-8');
    return JSON.parse(data);
  } catch {
    return { tasks: [] };
  }
}

function saveTasks(data: TaskData): void {
  writeFileSync(TASKs_FILE, JSON.stringify(data, null, 2));
}

function getNextId(tasks: Task[]): number {
  if (tasks.length === 0) return 1;
  return Math.max(...tasks.map(t => t.id)) + 1;
}

function addTask(title: string): void {
  const data = loadTasks();
  const id = getNextId(data.tasks);
  const task: Task = {
    id,
    title,
    status: 'pending',
    createdAt: new Date().toISOString()
  };
  data.tasks.push(task);
  saveTasks(data);
  console.log(`Task added (ID: ${id})`);
}

function listTasks(filter?: 'all' | 'pending' | 'completed'): void {
  const data = loadTasks();
  let tasks = data.tasks;

  if (filter === 'pending') {
    tasks = tasks.filter(t => t.status === 'pending');
  } else if (filter === 'completed') {
    tasks = tasks.filter(t => t.status === 'completed');
  }

  if (tasks.length === 0) {
    console.log('No tasks found.');
    return;
  }

  console.lm���q�%��Q�ѱ��������Mх��̜��(�����ͽ�������������������������������(��х̹ͭ�������хͬ�����(��������Ёѥѱ���хͬ�ѥѱ���Չ��ɥ�������ؤ��������ؤ�(�������ͽ����������хͬ���􀀀���ѥѱ�􀀑�хͬ��х�������(�����(�����ͽ���������)�()�չ�ѥ���������ѕQ�ͬ���聹յ��Ȥ�ٽ����(������Ё��ф�􁱽��Q�̠ͭ��(������Ёхͬ�􁑅ф�х̹ͭ�����Ѐ���й�����􁥐��(�������хͬ���(�������ͽ�����ɽȡ�Q�ͬ�����􁹽Ё��չ�����(����ɕ��ɸ�(���(��хͬ��х��̀􀝍�����ѕ���(��ٕͅQ�̡ͭ��ф��(�����ͽ��������Q�ͬ�����􁵅ɭ����́������ѕ���)�()�չ�ѥ�������ѕQ�ͬ���聹յ��Ȥ�ٽ����(������Ё��ф�􁱽��Q�̠ͭ��(������Ё������􁑅ф�х̹ͭ����%����Ѐ���й�����􁥐��(���������������Ĥ��(�������ͽ�����ɽȡ�Q�ͬ�����􁹽Ё��չ�����(����ɕ��ɸ�(���(����ф�х̹ͭ�����������ఀĤ�(��ٕͅQ�̡ͭ��ф��(�����ͽ��������Q�ͬ�����􁑕��ѕ����)�()�չ�ѥ����������ٽ����(������Ё�ɝ̀��ɽ���̹�ɝعͱ����Ȥ�(������Ё���������ɝ�l�t�((�����������������(�������ͽ��������Uͅ��聹��������๩̀񍽵������m�ɝ�t���(�������ͽ���������������蜤�(�������ͽ����������������ѥѱ���������������܁хͬ���(�������ͽ��������������Ёm���ѕ�t����1��Ёхͭ̀���������������������ѕ�����(�������ͽ�����������������є�������5�ɬ�хͬ��́������є���(�������ͽ���������������є������������є���хͬ���(����ɕ��ɸ�(���(��(��d=�э�������������(������͔�������(������������ɝ�l�t���(�����������ͽ�����ɽȠ�Q�ͬ�ѥѱ��ɕ�եɕ����(��������ɕ��ɸ�(�������(���������Q�ͬ��ɝ�l�t��(�������ɕ���(������͔�����М�(����������Q�̡ͭ�ɝ�l�t��̀���������������������������ѕ����(�������ɕ���(������͔��������є��(������������ɝ�l�t���(�����������ͽ�����ɽȠ�Q�ͬ�%�ɕ�եɕ����(��������ɕ��ɸ�(�������(������������ѕQ�ͬ����͕%�С�ɝ�l�t�������(�������ɕ���(������͔������є��(������������ɝ�l�t���(�����������ͽ�����ɽȠ�Q�ͬ�%�ɕ�եɕ����(��������ɕ��ɸ�(�������(����������ѕQ�ͬ����͕%�С�ɝ�l�t�������(�������ɕ���(��������ձ��(���������ͽ�����ɽȡ�U����ݸ��������耑퍽���������(���)�()�������