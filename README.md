# Task CLI

A Node.js command-line task manager that persists tasks to a JSON file.

Install and link the binary:

```bash
npm install
npm link
```

Usage:

```bash
task-cli [--file <path>] <command> [options]
```

The default storage file is `./tasks.json`. Use `--file <path>` to use a different JSON file.

Commands:

- `add <title>`: add a new pending task.
- `list [--filter <status>]`: list tasks; status is `all`, `pending`, or `completed`.
- `complete <id>`: mark a task as completed.
- `delete <id>`: delete a task permanently.
- `help`, `--help`, `-h`: show help.

Examples:

```bash
# Show help
task-cli --help
task-cli help

# Add a task
task-cli add "Buy groceries"
# Output: Task added (ID: 1)

# Use a custom storage file
task-cli --file ./work-tasks.json add "Send status report"
task-cli add "Send status report" --file ./work-tasks.json

# List tasks
task-cli list
task-cli list --filter pending
task-cli list --filter completed

# Complete and delete
task-cli complete 1
task-cli delete 1
```

The commands can also be run from the project directory with `node index.js` instead of `task-cli`.
