import { db } from "@/server/db/client";
import { getCurrentUser, requirePermission } from "@/server/policies";

export async function getExecutiveAnalytics(periodDays: number = 30) {
  const currentUser = await getCurrentUser();
  if (!currentUser) throw new Error("Unauthorized");

  requirePermission(currentUser, "report.read");

  const startDate = new Date(Date.now() - periodDays * 24 * 60 * 60 * 1000);

  const [customers, feedbackList, loyaltyTransactions, reservations] = await Promise.all([
    db.customer.findMany({
      where: {
        organizationId: currentUser.organizationId,
        status: "ACTIVE",
      },
      select: { id: true, visitCount: true, totalSpendNpr: true, createdAt: true },
    }),
    db.feedback.findMany({
      where: {
        organizationId: currentUser.organizationId,
        createdAt: { gte: startDate },
      },
      select: { rating: true, isNegative: true, status: true },
    }),
    db.loyaltyTransaction.findMany({
      where: {
        type: "EARNED",
        createdAt: { gte: startDate },
      },
      select: { points: true },
    }),
    db.reservation.findMany({
      where: {
        organizationId: currentUser.organizationId,
        reservationDateTime: { gte: startDate },
      },
      select: { status: true, partySize: true },
    }),
  ]);

  // Customer Retention & Cohorts
  const newGuestsCount = customers.filter((c) => c.createdAt >= startDate).length;
  const returningGuestsCount = customers.filter((c) => c.visitCount > 1).length;
  const churnedGuestsCount = customers.filter((c) => c.visitCount === 1).length;

  // Feedback Metrics
  const totalFeedback = feedbackList.length;
  const averageRating = totalFeedback > 0 ? Number((feedbackList.reduce((sum, f) => sum + f.rating, 0) / totalFeedback).toFixed(1)) : 5.0;
  const negativeFeedbackCount = feedbackList.filter((f) => f.isNegative).length;
  const resolvedFeedbackCount = feedbackList.filter((f) => f.status === "RESOLVED").length;

  // Loyalty Metrics
  const totalPointsIssued = loyaltyTransactions.reduce((sum, t) => sum + t.points, 0);

  return {
    periodDays,
    kpi: {
      activeCustomers: customers.length,
      newGuestsCount,
      returningGuestsCount,
      churnedGuestsCount,
      totalReservations: reservations.length,
      averageRating,
      negativeFeedbackCount,
      resolvedFeedbackCount,
      totalPointsIssued,
    },
  };
}
