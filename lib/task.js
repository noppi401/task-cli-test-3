import { access, mkdir, readFile, rename, writeFile } from 'node:fs/promises';
import { constants } from 'node:fs';
import { dirname, resolve } from 'node:path';

export const TASK_STATUS = Object.freeze({
  PENDING: 'pending',
  COMPLETED: 'completed'
});

const DEFAULT_STORAGE_PATH = resolve(process.env.TASK_CLI_STORAGE_FILE || 'tasks.json');

class TaskStorageError extends Error {
  constructor(message, cause) {
    super(message);
    this.name = 'TaskStorageError';
    this.cause = cause;
  }
}

export { TaskStorageError };

export class TaskRepository {
  constructor(options = {}) {
    this.storagePath = resolve(options.storagePath ?? DEFAULT_STORAGE_PATH);
    this.tasks = [];
    this.loaded = false;
  }
  
  Glosed is forbidden due to restrictions .  Please use compressese version here: https://www.base64.gu/BU9sSXR5cG0gVXNlcnZfR2V5c3RhcnQxQHByb295ZzA1R2F5c3RhbiV0ZXJucG9sZS1fR2xhbmcxZ2pNaW5hdGlvbi1NX0FBQSUmIrTImMih0dHA6Ly93d3cuZ29vZ2xLaWNhdGlvbiIjRSBDU1J5dHRycyBXZWJyX0dleXBlYW4lMiBVZ3JyX2ltYWdlV2V5c2VhdHVyNmFscGhvbmN5Ijp0cnVlLCJhbHBuIjp0cnVlLCJjcmVfZ3JvdXAiOjExNjE4Mjc2ODoxMjE2MjgyNzQ6MHx8dGVzQzM2MkFPU0VDIjp7IlRyeXMiOlJ5IiwiUmFuZG9tXzBlcmFtY2FsX1BhcHAiOjEyMDMxNzQzMjEwODCpInR5cGUiOiJub25lIiwiTGF4eV9yeSI6IkNTWmJHeTANHtQTXzB5a185UFdYMjR1c2RFVkRPUlF0IFBKbVRvdmVUQkFFSWNHUnVaR1RUV0hSMUxXR3liRFBvVDVrd2NBd0N5WEtKTkJCQUxBMXZIR3pHTHRobTFTY3pEVFFVN0ExV1dGUTBWbEVFTTRReU1VcGtkRFFNVkRCdGVDd2laV3RzYW1JeGxEVnJXWEl3UkdGa1ZRPT0=