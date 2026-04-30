# Task Management CLI

A node.js CLI for managing tasks with durable JSON file storage. It supports adding, listing, completing, and deleting tasks.

## Installation

```bash
npm install
npm run build
```

## Usage

The default storage file is `.tasks.json`. Use `--file <path>` or `-f <path>` to specify a different JSON file.

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
node dist/index.js -f ./data/work.json list
```

## Commands

### `add <description>`

Creates a pending task with a unique ID and creation timestamp.

### `list [--filter <status>]`

Lists tasks with ID, title, status, creation timestamp, and completion timestamp when present. The optional filter accepts `all`, `pending`, or `completed`.

### `complete <task_id>`

Marks a pending task as completed and records a completion timestamp.

### `delete <task_id>`

Deletes a task permanently.

## Data Storage

Tasks are stored in JSON using this structure:

```json
{
  "tasks": [
    {
      "id": 1,
      "title": "Buy groceries",
      "status": "pending",
      "createdAt": "2024-01-01T10:00:00.000Z"
    },
    {
      "id": 2,
      "title": "Finish report",
      "status": "completed",
      "createdAt": "2024-01-01T11:00:00.000Z",
      "completedAt": "2024-01-01T12:00:00.000Z"
    }
  ]
}
```

Pending tasks omit `completedAt`. Completed tasks store `completedAt` as an ISO-8601 string. The parser also tolerates legacy files with `completedAt: null`.

The CLI creates the storage file if it does not exist. Writes are persisted immediately after add, complete, and delete operations.

## Testing

```bash
nmp test
```
