import{TaskRepository,TaskValidationError,validateFilter}from'./task.js';

const HELP='Usage: add <text> | list [--filter all|pending|completed] | complete <id> | delete <id>';

export async function runCli(argv=process.argv.slice(2),options={}){
  const out=options.stdout||process.stdout;
  const err=options.stderr||process.stderr;
  try{
    if(argv.length===0||argv.includes('--help')||argv.includes('-h')){out.write(HELP+'\n');return 0;}
    const repo=options.repository||new TaskRepository();
    const [cmd,...rest]=argv;
    if(cmd==='add'){
      const task=await repo.add(rest.join(' '));
      out.write(`Task added (ID: ${task.id})\n`);return 0;
    }
    if(cmd==='list'){
      let filter='all';
      const i=rest.indexOf('--filter');
      if(i!==-1)filter=validateFilter(rest[i+1]);
      const tasks=await repo.list(filter);
      out.write(tasks.length?tasks.map(t=>`${t.id} ${t.title} ${t.status}`).join('\n')+'\n':'No tasks found.\n');return 0;
    }
    if(cmd==='complete'){
      if(rest.length!==1)throw new TaskValidationError('Usage: complete <task_id>');
      const task=await repo.complete(rest[0]);
      out.write(`Task ${task.id} marked as complete\n`);return 0;
    }
    if(cmd==='delete'){
      if(rest.length!==1)throw new TaskValidationError('Usage: delete <task_id>');
      const id=await repo.delete(rest[0]);
      out.write(`Task ${id} deleted\n`);return 0;
    }
    throw new TaskValidationError('Unknown command');
  }catch(e){
    err.write(`Error: ${e.message||String(e)}\n`);
    err.write('Run `node index.js --help` for usage.\n');
    return 1;
  }
}
