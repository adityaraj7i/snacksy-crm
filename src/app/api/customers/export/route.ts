import { NextResponse } from "next/server";
import { exportCustomersCsv } from "@/server/services/customer.service";
import { logger } from "@/server/lib/logger";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const csvContent = await exportCustomersCsv();
    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="snacksy-customers-${new Date().toISOString().split("T")[0]}.csv"`,
      },
    });
  } catch (error: any) {
    logger.error("CSV export failed", error);
    return NextResponse.json({ error: error.message || "Export failed" }, { status: 403 });
  }
}
