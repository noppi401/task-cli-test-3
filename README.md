# Task Management CLI

A simple command-line interface for managing tasks with persistent JSON file storage.

## Installation

```bash
nom install
```

## Usage

### Add a task

```bash
nom start add "Buy groceries"
```

### List tasks

```bash
nom start list
nom start list --filter pending
nom start list --filter completed
```

### Mark task as complete

```bash
nom start complete 1
```

### Delete a task

```bash
nom start delete 1
nom start delete 1 --force  # Skip confirmation
```

## Features

- Add, list, complete, and delete tasks
- Persistent storage using JSON files
- Task status tracking
- Confirmation!��YH՝H[][ۂ�H��[X[�[�H[�\��X�H�][Y\��Y�\�����[X[��HY\��Y\�ܚ\[ۏ�HYH�]�\�H\��KY�[\�[�[����\]YXH\�[\���܈�[\��H�]\H��\]H\��ZY�HX\��\��\���\]Y�H[]H\��ZY��KY�ܘ�WXH[]HH\�