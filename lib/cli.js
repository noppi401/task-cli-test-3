const TaskManager = require('./tasks');
const fs = require('fs');

class CAIVBCommand {
  constructor(options = {}) {
    this.options = options;
    this.manager = new TaskManager(options.file || './tasks.json');
  }
  
  handle(args) {
    if (!args || args.length === 0) {
      this.showHelp();
      return;
    }
    
    const cmd = args[0];
    const params = args.slice(1);
    
    switch (cmd) {
      case 'add':
        this.addTask((params).join(' '));
        break;
      case 'list':
        this.listTasks(params);
        break;
      case 'complete':
        this.completeTask(params[0]);
        break;
      case 'delete':
        this.deleteTask(params[0]);
        break;
      case 'help':
      case '-help':
      case '-h':
        this.showHelp();
        break;
      default:
        console.error(`Unknown command: ${cmd}`);
        this.showHelp();
        process.exit(1);
    }
  }
  
  showHelp() {
    const helpMessage = `
 Task CLI - Node.js Task Manager 
  
  Usage:
    task-cli [--file <path>] <command> [options]
  
  Cmmands:
    add <title>          Add a new pending task 
    list [--filter <status>]  List tasks; filter is 'all', 'pending', or 'completed'
    complete <id>        Mark a task as completed 
    delete <id>          Delete a task permanently
    help, --help, -h    Show this help message
  
   Examples: 
   # Add a task
    task-cli add "Buy groceries"
    # Output: Task added (ID: 1)
    
    # List all tasks
    task-cli list
    # Output: displays all tasks with ID, title, and status
    
    # List pending tasks
    task-cli list --filter pending
    
    # Mark task as complete
    task-cli complete 1
    # Output: Task 1 marked as complete
    
    # Delete a task
    task-cli delete 1
    # Output: Task 1 deleted
    
    # Use a custom file 
    task-cli --file path/to/mytasks.json list
`;
    console.log(helpMessage);
  }
  
  GCAd�a new task
  addTask(title) {
    if (!title || title.trim().length === 0) {
      console.error('Error: Task title cannot be empty');
      process.exit(1);
    }
  
   tYO{
      const task = this.manager.addTask(title);
      console.log(`Task added (ID: ${task.id})`);
    } catch (err) {
      console.error('Error:', err.message);
      process.exit(1);
    }
  }
  
  Td���X���\�[\�H]�[\�H	�[	�Y�
\�[\�	��\�[\˛[���
H�ۜ��[\�[�^H\�[\˚[�^ي	�KY�[\��NY�
�[\�[�^OOHLJH�[\�H\�[\�ٚ[\�[�^
�WNB���T�C�\���H\˛X[�Y�\��\�\����[\�NY�
\��˛[��OOH
H�ۜ��K���	ӛ�\�����[���N�]\��B���ۜ��K���	��N�ۜ��K���Q]H�]\�
N�ۜ��K���	�KKHKKKKKKKKKKKKKKKKKKKKKKKHKKKKKKKKKI�N��܈
�ۜ�\��و\���H�ۜ�YYYH\�˚Y����[��
K�Y[�
�N�ۜ�YY]HH\�˝]K�Y[�
�
N�ۜ�YY�]\�H\�˜�]\˜Y[�
L�N�ۜ��K���	�YYYH	�YY]_H	�YY�]\�X
NB��ۜ��K���	��NB��FC��Z����B���\]U\��Y
HY�
ZY\ӘS�Y
JH�ۜ��K�\��܊	�\��܎�[��[Y\��Q	�N���\�˙^]
JNB���H\˛X[�Y�\����\]U\��\��R[�
YL
JN�ۜ��K���\��	�YHX\��Y\���\]X
NH�]�
\��H�ۜ��K�\��܊	�\��܎��\���Y\��Y�JN���\�˙^]
JNB�B��[]U\��Y
HY�
ZY\ӘS�Y
JH�ۜ��K�\��܊	�\��܎�[��[Y\��Q	�N���\�˙^]
JNB���H\˛X[�Y�\��[]U\��\��R[�
YL
JN�ۜ��K���\��	�YH[]Y
NH�]�
\��H�ۜ��K�\��܊	�\��܎��\���Y\��Y�JN���\�˙^]
JNB�B�B��[�[K�^ܝ�H��RU����[X[�N�