import { NextResponse } from "next/server";
import { db } from "@/server/db/client";
import { getCurrentUser, requirePermission } from "@/server/policies";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const currentUser = await getCurrentUser();
  if (!currentUser) return new NextResponse("Unauthorized", { status: 401 });

  try {
    requirePermission(currentUser, "report.export");
  } catch {
    return new NextResponse("Forbidden", { status: 403 });
  }

  const feedbackList = await db.feedback.findMany({
    where: { organizationId: currentUser.organizationId },
    include: { customer: { select: { firstName: true, lastName: true, phone: true } } },
    orderBy: { createdAt: "desc" },
  });

  let csv = "Feedback ID,Customer Name,Phone,Rating,Status,Comment,Created At\n";
  feedbackList.forEach((f) => {
    const name = f.customer ? `${f.customer.firstName} ${f.customer.lastName || ""}`.trim() : "Guest";
    const comment = (f.comment || "").replace(/"/g, '""');
    csv += `"${f.id}","${name}","${f.customer?.phone || ""}","${f.rating}★","${f.status}","${comment}","${f.createdAt.toISOString()}"\n`;
  });

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="feedback_report_${Date.now()}.csv"`,
    },
  });
}
