import { db } from "@/server/db/client";
import { getCurrentUser, requirePermission } from "@/server/policies";
import { logger } from "@/server/lib/logger";
import { revalidatePath } from "next/cache";

export async function getFeedbackList() {
  const currentUser = await getCurrentUser();
  if (!currentUser) throw new Error("Unauthorized");

  requirePermission(currentUser, "feedback.read");

  return db.feedback.findMany({
    where: { organizationId: currentUser.organizationId },
    include: {
      customer: { select: { id: true, firstName: true, lastName: true, phone: true, email: true } },
      branch: { select: { id: true, name: true } },
      tasks: { select: { id: true, status: true, priority: true } },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function recordCustomerFeedback(data: {
  branchId: string;
  customerId: string;
  rating: number; // 1 to 5
  comment?: string;
  visitId?: string;
  orderId?: string;
}) {
  const currentUser = await getCurrentUser();
  if (!currentUser) throw new Error("Unauthorized");

  const isNegative = data.rating <= 2;

  const feedback = await db.feedback.create({
    data: {
      organizationId: currentUser.organizationId,
      branchId: data.branchId,
      customerId: data.customerId,
      visitId: data.visitId,
      orderId: data.orderId,
      rating: data.rating,
      comment: data.comment?.trim(),
      isNegative,
      status: "OPEN",
    },
  });

  // AUTOMATIC LOW RATING RECOVERY WORKFLOW:
  // When rating <= 2 stars, automatically generate an URGENT staff recovery task
  if (isNegative) {
    const customer = await db.customer.findUnique({
      where: { id: data.customerId },
      select: { firstName: true, lastName: true, phone: true },
    });
    const guestName = customer ? `${customer.firstName} ${customer.lastName || ""}`.trim() : "Guest";

    await db.task.create({
      data: {
        organizationId: currentUser.organizationId,
        branchId: data.branchId,
        customerId: data.customerId,
        feedbackId: feedback.id,
        title: `URGENT: Low Rating Recovery (${data.rating}★) - ${guestName}`,
        description: `Guest submitted a ${data.rating}-star rating: "${data.comment || "No comment provided"}". Contact guest at ${customer?.phone || "N/A"} to offer resolution.`,
        priority: "URGENT",
        category: "FEEDBACK_RECOVERY",
        status: "TODO",
        createdById: currentUser.id,
      },
    });

    logger.warn("Low rating received! Recovery task automatically dispatched.", { feedbackId: feedback.id, rating: data.rating });
  }

  revalidatePath("/feedback");
  revalidatePath("/tasks");
  return feedback;
}

export async function resolveFeedback(feedbackId: string, resolutionNotes: string) {
  const currentUser = await getCurrentUser();
  if (!currentUser) throw new Error("Unauthorized");

  requirePermission(currentUser, "feedback.manage");

  const updatedFeedback = await db.feedback.update({
    where: { id: feedbackId },
    data: {
      status: "RESOLVED",
      resolutionNotes: resolutionNotes.trim(),
      resolvedById: currentUser.id,
    },
  });

  // Automatically mark linked recovery tasks as COMPLETED
  await db.task.updateMany({
    where: { feedbackId },
    data: { status: "COMPLETED" },
  });

  revalidatePath("/feedback");
  revalidatePath("/tasks");
  return updatedFeedback;
}
