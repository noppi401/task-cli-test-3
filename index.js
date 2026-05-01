import { CLI } from './lib/cli.js';
import { resolve } from 'node:path';

async function main() {
  const args = process.argv.slice(2);
  if (args.length === 0) {
    console.log('Usage: node index.js <command> [args...]');
    console.log('Run: node index.js help');
    process.exit(1);
  }
  const command = args[0];
  const commandArgs = args.slice(1);
  const cli = new CLI(resolve('./tasks.json'));
  try {
    await cli.taskManager.initialize();
    const response = await cli.execute(command, commandArgs);
    if (response.success) {
      if (response.message) {
        console.log(`✅ ${response.message}`);
      } else if (response.tasks) {
        if (response.tasks.length === 0) {
          console.log('No tasks found');
        } else {
          console.log('\nID  Title                    Status   Created');
          console.log('--  -----                     ------   -------');
          response.tasks.forEach((task) => {
            const createdDate = new Date(task.createdAt).toLocaleDateString();
            const title = task.title.length > 30 ? task.title.substring(0, 27) + '...' : task.title;
            console.lm�����хͬ����ѽM�ɥ�����������̥��ѥѱ�������������хͬ��х��̹���������ɕ�ѕ��ѕ����(�������������(���������(��-􁕱͔��(�������������ͽ�����ɽȡ��D��ɽ�耑�ɕ����͔���ɽ�����(�����������ɽ���̹��РĤ�(�������(��􁍅э�����ɽȤ��(�������ͽ�����ɽȡ��rD��х����ɽ�耑��ɽȹ���ͅ������(�����ɽ���̹��РĤ�(���)�()�������(