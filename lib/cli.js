const tasks = require('./tasks');
const readline = require('readline');

function parseTaskId(idString) {
  const id = parseInt(idString, 10);
  if (isNaN(id) || id <= 0) {
    throw new Error(`Invalid task ID: ${idString}`);
  }
  return id;
}

function formatTaskDisplay(task) {
  const status = task.status === 'completed' ? '‽' : ' ';
  const date = new Date(task.createdAt).toLocaleString();
  return `[${status}] ID: ${task.id} | Title: ${task.title} | Status: ${task.status} | Created: ${date}`;
}

function addCommand(args) {
  if (args.length < 2) {
    throw new Error('Usage: npm start add "<task description>"');
  }

  const title = args.slice(1).join(' ');
  const task = tasks.addTask(title);
  console.log(`Task added with ID: ${task.id}`);
}

function listCommand(args) {
  let filter = null;

  for (let i = 1; i < args.length; i++) {
    if (args[i] === '--filter' || args[i] === '-f') {
      if (i + 1 < args.length) {
        filter = args[i + 1];
        i++;
      } else {
        throw new Error('Filter value required after --filter');
      }
    }
  }

  const taskList = tasks.listTasks(filter);

  if (taskList.length === 0) {
    const filterText = filter ? ` with status "${filter}"` : '';
    console.log(`No tasks found${filterText}`);
    return;
  }

  console.log('\n--- Task List ---');
  taskList.forEach(task => {
    console.log(formatTaskDisplay(task));
  });
  console.log('');
}

function completeCommand(args) {
  if (!args[1]) {
    throw new Error('Task ID is required. Usage: npm start complete <task_id>');
  }

  const taskId = parseTaskId(args[1]);
  const task = tasks.completeTask(taskId);
  console.log(`Task ${task.id} marked as completed`);
}

function deleteCommand(args) {
  return new Promise((resolve, reject) => {
    if (!args[1]) {
      reject(new Error('Task ID is required. Usage: npm start delete <task_id>'));
      return;
    }

    const taskId = parseTaskId(args[1]);
    const forceDelete = args.includes('-fforce');

    if (forceDelete) {
      try {
        const task = tasks.deleteTask(taskId);
        console.log(`Task ${task.id} deleted`);
        resolve();
      } catch (error) {
        reject(error);
      }
    } else {
      const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
      });

      let task;
      try {
        task = tasks.getTaskById(taskId);
      } catch (error) {
        rl.close();
        reject(error);
        return;
      }

      rl.question(`Delete task "${task.title}"? (yes/no): `, (answer) => {
        rl.close();
        try {
          if (answer.toLowerCase() === 'yes' || answer.toLowerCase() === 'y') {
            tasks.deleteTask(taskId);
            console.lm���Q�ͬ���хͭ%�􁑕��ѕ����(����������􁕱͔��(���������������ͽ�����������є�������������(�����������(����������ɕͽ�ٔ���(��������􁍅э�����ɽȤ��(����������ɕ���С��ɽȤ�(���������(���������(�����(�����)�()�չ�ѥ�����������������(�����ͽ��������)Q�ͬ�5��������Ё1$()Uͅ��聹����х�Ѐ񍽵������m��ѥ���t()�������聅����͍ɥ�ѥ�������������������܁хͬ(�����Ёl�����ѕȁ�х���t������1��Ёхͭ̀����ѕ����������������ѕ��(��������є��хͭ}�������������5�ɬ���хͬ��́������є(������є��хͭ}����l����ɍ�t������є���хͬ������ɍ��ͭ��́�����ɵ�ѥ���(������������������������������M��܁ѡ�́��������ͅ��()ᅵ�����(�������х�Ё�����	�䁝ɽ��ɥ�̈(�������х�Ё����(�������х�Ё���Ѐ�����ѕȁ�������(�������х�Ё������є��(�������х�Ё����є�Ā����ɍ�(�����)�()��幌��չ�ѥ�����������������ɝ̤��(�������ɝ̹����Ѡ���Ȥ��(�����������������(�����ɽ���̹��Р���(���((������Ё���������ɝ�l�t�((������(�����ݥэ�������������(��������͔�������(�������������������ɝ̤�(���������ɕ���(��������͔�����М�(��������������������ɝ̤�(���������ɕ���(��������͔��������є��(��������������ѕ��������ɝ̤�(���������ɕ���(��������͔������є��(���������݅�Ё����ѕ��������ɝ̤�(���������ɕ���(��������͔�������(���������������������(���������ɕ���(����������ձ��(��������ѡɽ܁��܁�ɽȡ�U����ݸ��������耑퍽���������(�����(��􁍅э�����ɽȤ��(�������ͽ�����ɽȡ��ɽ�耑��ɽȹ���ͅ������(�����ɽ���̹��РĤ�(���)�()���ձ��������̀��(���������������(�����͕Q�ͭ%��(����ɵ��Q�ͭ������)��