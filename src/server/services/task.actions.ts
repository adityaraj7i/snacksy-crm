"use server";

import { createTask, updateTaskStatus } from "./task.service";

export async function createTaskAction(data: Parameters<typeof createTask>[0]) {
  return createTask(data);
}

export async function updateTaskStatusAction(taskId: string, status: "TODO" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED") {
  return updateTaskStatus(taskId, status);
}
