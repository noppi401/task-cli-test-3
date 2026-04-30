const { TaskStore } = require('./tasks');

const VERSION = '1.0.0';
const VALID_FILTERS = new Set(['all', 'pending', 'completed']);

class CLI {
  constructor(options = {}) {
    this.storePath = options.file || './tasks.json';
    this.store = new TaskStore(this.storePath);
  }

  async run(args) {
    let parsed;

    try {
      parsed = parseGlobalOptions(args);
    } catch (error) {
      console.error(`Error: ${error.message}`);
      return 1;
    }

    if (parsed.help || parsed.command === 'help' || !parsed.command) {
      this.showHelp();
      return 0;
    }

    if (parsed.version) {
      console.log(VERSION);
      return 0;
    }

    if (parsed.file) {
      this.storePath = parsed.file;
      this.store = new TaskStore(this.storePath);
    }

    try {
      switch (parsed.command) {
        case 'add':
          await this.addTask(parsed.params);
          return 0;
        case 'list':
          await this.listTasks(parsed.params);
          return 0;
        case 'complete':
          await this.completeTask(parsed.params);
          return 0;
        case 'delete':
          await this.deleteTask(parsed.params);
          return 0;
        default:
          console.error(`Unknown command: ${parsed.command}`);
          console.error('Use --help for usage information.');
          return 1;
      }
    } catch (error) {
      console.error(`Error: ${error.message}`);
      return 1;
    }
  }

  showHelp() {
    console.log(`Task Management CLI v${VERSION}

Usage:
  task-cli [--file <path>] <command> [options]
  node index.js [--file <path>] <command> [options]

Commands:
  add <title>                  Add a new task
  list [--filter <status>]     List tasks. Status: all, pending, completed
  complete <id>                Mark a task as completed
  delete <id>                  Delete a task
  help                         Show this help message

Global Options:
  --file <path>                JSON storage file (default: ./tasks.json)
  -h, --help                  Show help
  -v, --version                Show version

Examples:
  task-cli add "Buy groceries"
  task-cli list
  task-cli list --filter pending
  task-cli --file ./work.json add "Write report"
  task-cli complete 1
  task-cli delete 1`);
  }

  async addTask(params) {
    if (params.length === 0) {
      throw new Error('Task title is required. Usage: add <title>');
    }

    const title = params.join(' ');
    const task = this.store.addTask(title);
    console.log(`Task added (ID: ${task.id})`);
  }

  async listTasks(params) {
    const filter = parseFilter(params);
    const tasks = this.store.listTasks(filter);

    if (tasks.length === 0) {
      console.log(filter === 'all' ? 'No tasks found.' : `No ${filter} tasks found.`);
      return;
    }

    const rows = [
      ['ID', 'Title', 'Status', 'Created At'],
      ['--', '-----', '------', '----------'],
      ...tasks.map(task => [
        String(task.id),
        task.title,
        task.status,
        formatDate(task.createdAt)
      ])
    ];

    const widths = rows[0].map((_, column) => (
      Math.max(...rows.map(row => String(row[column]).length))
    ));

    rows.forEach(row => {
      console.log(row.map(�[YK[�^
HO���[���[YJK�Y[�
�Y��[�^JJK���[�	�	�JNJNB��\�[����\]U\��\�[\�H�ۜ�YH\��U\��Y
\�[\��K	���\]HY��N\˜�ܙK���\]U\��Y
N�ۜ��K���\��	�YHX\��Y\���\]X
NB��\�[��[]U\��\�[\�H�ۜ�YH\��U\��Y
\�[\��K	�[]HY��N\˜�ܙK�[]U\��Y
N�ۜ��K���\��	�YH[]Y
NB�B���[��[ۈ\��Q�ؘ[�[ۜ�\�݊H�ۜ�\���H\�݋��X�J�N�ۜ�\�[\�H�N�ۜ��\�[H��[X[��[�Y�[�Y�\�[\���[N�[�Y�[�Y�[��[�K��\��[ێ��[�B�N��܈
][�^H�[�^\��˛[���[�^
�HJH�ۜ�\��H\����[�^N�Y�
\��OOH	�KZ[	�\��OOH	�Z	�H�\�[�[H�YN�۝[�YNB��Y�
\��OOH	�K]�\��[ۉ�\��OOH	�]��H�\�[��\��[ۈH�YN�۝[�YNB��Y�
\��OOH	�KY�[I�H�ۜ��[HH\����[�^
�WNY�
Y�[H�[K��\���]
	�I�JH����]�\��܊	�Z\��[���[YH�܈KY�[K�\�Y�N�KY�[H]��NB��\�[��[HH�[N[�^
�HN�۝[�YNB��Y�
\�˜�\���]
	�KY�[OI�JH�ۜ��[HH\�˜�X�J	�KY�[OI˛[��
NY�
Y�[JH����]�\��܊	�Z\��[���[YH�܈KY�[K�\�Y�N�KY�[H]��NB��\�[��[HH�[N�۝[�YNB��Y�
\�\�[���[X[�
H�\�[���[X[�H\��H[�H\�[\˜\�
\��NB�B���]\���\�[B���[��[ۈ\��Q�[\�\�[\�HY�
\�[\˛[��OOH
H�]\��	�[	�B��Y�
\�[\��HOOH	�KY�[\��H�ۜ��[\�H\�[\��WNY�
Y�[\�H����]�\��܊	�Z\��[���[YH�܈KY�[\��\�Y�N�\�KY�[\�[[�[����\]Y��NB�Y�
\�[\˛[����H����]�\��܊	�[�^X�Y\��[Y[���܈\��\�Y�N�\��KY�[\�[[�[����\]Y�I�NB��]\���[Y]Q�[\��[\�NB��Y�
\�[\��K��\���]
	�KY�[\�I�JHY�
\�[\˛[���JH����]�\��܊	�[�^X�Y\��[Y[���܈\��\�Y�N�\��KY�[\�[[�[����\]Y�I�NB��]\���[Y]Q�[\�\�[\��K��X�J	�KY�[\�I˛[��
JNB��Y�
\�[\˛[��OOHH	���SQђST�˚\�\�[\��JJH�]\��\�[\��NB������]�\��܊	�[�^X�Y\��[Y[���܈\��\�Y�N�\��KY�[\�[[�[����\]Y�I�NB���[��[ۈ�[Y]Q�[\��[\�HY�
U�SQђST�˚\��[\�JH����]�\��܊	њ[\�]\��HۙHَ�[[�[����\]Y	�NB��]\���[\�B���[��[ۈ\��U\��Y
�[YK\�Y�JH�ۜ�YH�[X�\��[YJNY�
S�[X�\��\�[�Y�\�Y
HYJH����]�\��܊H��]]�H�[Y\�X�\��Q\��\]Z\�Y�\�Y�N�	�\�Y�_X
NB��]\��YB���[��[ۈ�ܛX]]J�[YJHY�
]�[YJH�]\��	��B���ۜ�]HH�]�]J�[YJNY�
�[X�\��\ӘS�]K��][YJ
JJH�]\����[���[YJNB���]\��]K����[T��[��
NB��\�[���[��[ۈ�[�\�݈H���\�˘\�݊H�ۜ��HH�]��J
N�]\���K��[�\�݊NB��[�[K�^ܝ�H��K�[�N�