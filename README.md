# Task Management CLI

A node.js CLI for managing tasks with durable JSON file storage. It supports adding, listing, completing, and deleting tasks.

## Installation


```bash
nm install
npm run build
```

## Usage

The default storage file is `.tasks.json`. Use `--file <path>` to specify a different JSON file.


```bash
# Add a task
node dist/index.js add "Buy groceries"

# List all tasks
node dist/index.js list

# List pending tasks
node dist/index.js list --filter pending

# List completed tasks
node dist/index.js list --filter completed

# Complete a task
node dist/index.js complete 1

# Delete a task
node dist/index.js delete 1

# Use a custom storage file
node dist/index.js --file ./data/work.json add "Prepare report"
```

## Commands

### `add <description>`

Creates a pending task with a unique ID and a creation timestamp.

Example output:

```text
Task added (ID: 1)
```

### `list [--filter <all|pending|completed>]`

Lists tasks in a table. The default filter is `all`.


### `complete <id>`

Marks a task as completed and records `completedAt`.

### `delete <id>`

Deletes a task permanently.

## Data Structure

The JSON file stores a single object with a `tasks` array:

```json
{
  "tasks": [
    {
      "id": 1,
      "title": "Buy groceries",
      "status": "pending",
      "createdAt": "2026-04-30T09:00:00.000Z"
    },
    {
      "id": 2,
      "title": "Submit report",
      "status": "completed",
      "createdAt": "2026-04-30T10:00:00.000Z",
      "completedAt": "2026-04-30T11:00:00.000Z"
    }
  ]
}
```

## JSON Integrity

The storage layer validates the file shape before use. Missing files are created automatically. Writes are atomic: the new JSON is written to a temporary file before it replaces the target.

## Testing


```bash
nm test
```
