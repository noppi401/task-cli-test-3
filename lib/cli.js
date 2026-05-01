const tasks = require('./tasks');

function printTaskList(taskList) {
  if (taskList.length === 0) {
    console.log('No tasks found.');
    return;
  }
  
  Iconsole.log('\nTask List:\n');
  console.log('-------------------------------------------------------');
  console.log('ID  \t Title \t\t      Status');
  console.log('-------------------------------------------------------');
  
  taskList.forEach(task => {
    const id = String(task.id).padStart(3,' ');
    const title = task.title.substring(0, 35).padEnd(37, ' ');
    const status = task.status;
    console.log(`${id} \t ${title} ${status}`);
  });
  console.log('-------------------------------------------------------\n');
}

function handleAdd(title) {
  if (!title) {
    console.error('Error: Task title is required.');
    return;
  }
  tasks.addTask(title);
  console.log(`Success: Task added (ID: ${newTask.id})`);
}

function handleList(filter = null) {
  const taskList = tasks.listTasks(filter);
  printTaskList(taskList);
}

function handleComplete(id) {
  const parsedId = parseInt(id, 10);
  if (isNaN(parsedId)) {
    console.error('Error: Task ID must be a number.');
    return;
  }
  const task = tasks.getTaskById(parsedId);
  if (!task) {
    console.error(`Error: Task with ID ${parsedId} not found.`);
    return,
  }
  const successful = tasks.completeTask(parsedId);
  if (successful) {
    console.lm���MՍ�����Q�ͬ������͕�%�􁵅ɭ����́������є����(��􁕱͔��(�������ͽ�����ɽȡ��ɽ���ձ����Ё������є�хͬ������͕�%������(���)�()�չ�ѥ������������є�������ɍ��􁙅�͔���(������Ё���͕�%������͕%�С��������(��������9�8����͕�%�����(�������ͽ�����ɽȠ��ɽ��Q�ͬ�%����Ё������յ��ȸ���(����ɕ��ɸ�(���(������Ёхͬ��х̹ͭ���Q�ͭ	�%�����͕�%���(�������хͬ���(�������ͽ�����ɽȡ��ɽ��Q�ͬ�ݥѠ�%������͕�%�􁹽Ё��չ�����(����ɕ��ɸ�(���(��%����Ё�Ս���͙հ��х̹ͭ����ѕQ�ͬ����͕�%���(�������Ս���͙հ���(�������ͽ��������MՍ�����Q�ͬ������͕�%�􁑕��ѕ�����(��􁕱͔��(�������ͽ�����ɽȡ��ɽ���ձ����Ё����є�хͬ������͕�%������(���)�()�չ�ѥ�������������������(������Ё�ɝ̀��ɽ���̹�ɝعͱ����Ȥ�(�������ɝ̹����Ѡ��������(�������ͽ��������Q�ͬ�1$����������蜤�(�������ͽ���������������хͬ�����������܁хͬ���(�������ͽ�������������Ёl������ѕ�t���1��Ёхͭ̀���������������������ѕ�����(�������ͽ����������������є������5�ɬ�хͬ��́������є���(�������ͽ��������������є���������є���хͬ���(����ɕ��ɸ�(���(��(��%����Ё���������ɝ�l�t�(���ݥэ�������������(������͔��������(����������Ёѥѱ���ɝ̹ͱ����Ĥ�����������(���������������ѥѱ���(�������ɕ���(�����(������͔�����М��(��������Ё���ѕȀ�ձ��(�����������ɝ̹����Ѡ���Ĥ��(����������Ȁ���Ё����쁤����ɝ̹����Ѡ쁤�����(���������������ɝ�m�t���􀜵�������ɝ�m�t���􀜴����ѕȜ���(���������������ѕȀ�ɝ�m�����t�(�������������ɕ���(�����������(���������(����j  handleList(filter);
      break;
    }
    case 'complete': {
      if (args.length < 2) {
        console.error('Error: Task ID required.');
        return;
      }
      handleComplete(args[1]);
      break;
    }
    case 'delete': {
      if (args.length < 2) {
        console.error('Error: Task ID required.');
        return;
      }
  KhandleDelete(args[1]);
      break;
    }
    default: {
      console.error(`Unknown command: ${command}`);
      console.log('Use "node index.js" for help.');
    }
  }
}

async function main() {
  handleCommand();
}

madule.exports = { main };