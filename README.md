# Task Management CLI

A small Node.js command-line app for managing tasks with JSON file persistence.

## Usage

```bash
node index.js --help
task-cli <command> [options]
```

## Commands

```bash
task-cli add "Buy groceries"
task-cli list
task-cli list --filter pending
task-cli list --filter completed
task-cli complete 1
task-cli delete 1
```

## Options

```text
--file <path>    JSON storage file (default: ./tasks.json)
-h, -help       Show help
-v, --version    Show version
```

## Example Output

```text
Task added (ID: 1)

ID Title          Status   Created At
--  -------------  -------  ------------------------
1   Buy groceries  pending  2026-04-30T00:00:00.000Z

Task 1 marked as complete
Task 1 deleted
```

## Storage

Tasks are saved to `./tasks.json` by default:


```json
{
  "tasks": [
    {
      "id": 1,
      "title": "Buy groceries",
      "status": "pending",
      "createdAt": "2026-04-30T00:00:00.000Z"
    }
  ]
}
```
