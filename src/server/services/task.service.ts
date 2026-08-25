import { db } from "@/server/db/client";
import { getCurrentUser, requirePermission } from "@/server/policies";
import { logger } from "@/server/lib/logger";
import { revalidatePath } from "next/cache";

export async function getTasks() {
  const currentUser = await getCurrentUser();
  if (!currentUser) throw new Error("Unauthorized");

  requirePermission(currentUser, "task.read");

  const tasks = await db.task.findMany({
    where: { organizationId: currentUser.organizationId },
    include: {
      customer: { select: { id: true, firstName: true, lastName: true, phone: true } },
      feedback: { select: { id: true, rating: true, comment: true } },
      assignedTo: { select: { id: true, fullName: true } },
    },
    orderBy: [{ priority: "desc" }, { createdAt: "desc" }],
  });

  return {
    todoTasks: tasks.filter((t) => t.status === "TODO"),
    inProgressTasks: tasks.filter((t) => t.status === "IN_PROGRESS"),
    completedTasks: tasks.filter((t) => t.status === "COMPLETED"),
    allTasks: tasks,
  };
}

export async function createTask(data: {
  title: string;
  description?: string;
  priority?: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
  category?: "FEEDBACK_RECOVERY" | "RESERVATION_FOLLOWUP" | "GENERAL";
  branchId?: string;
  customerId?: string;
  dueDate?: string;
}) {
  const currentUser = await getCurrentUser();
  if (!currentUser) throw new Error("Unauthorized");

  requirePermission(currentUser, "task.manage");

  const task = await db.task.create({
    data: {
      organizationId: currentUser.organizationId,
      branchId: data.branchId,
      customerId: data.customerId,
      title: data.title.trim(),
      description: data.description?.trim(),
      priority: data.priority || "MEDIUM",
      category: data.category || "GENERAL",
      status: "TODO",
      dueDate: data.dueDate ? new Date(data.dueDate) : null,
      createdById: currentUser.id,
    },
  });

  logger.info("Staff task created", { taskId: task.id, priority: data.priority });
  revalidatePath("/tasks");
  return task;
}

export async function updateTaskStatus(taskId: string, status: "TODO" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED") {
  const currentUser = await getCurrentUser();
  if (!currentUser) throw new Error("Unauthorized");

  requirePermission(currentUser, "task.manage");

  const task = await db.task.update({
    where: { id: taskId },
    data: { status },
  });

  revalidatePath("/tasks");
  return task;
}
