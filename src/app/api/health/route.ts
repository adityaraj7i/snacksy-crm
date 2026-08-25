import { NextResponse } from "next/server";
import { db } from "@/server/db/client";
import { logger } from "@/server/lib/logger";

export async function GET() {
  let dbStatus = "disconnected";
  try {
    // Safe lightweight query to verify PostgreSQL connectivity
    await db.$queryRaw`SELECT 1`;
    dbStatus = "connected";
  } catch (error) {
    logger.error("Health check database query failed", error);
    dbStatus = "error";
  }

  const isHealthy = dbStatus === "connected";
  const statusCode = isHealthy ? 200 : 503;

  return NextResponse.json(
    {
      status: isHealthy ? "ok" : "degraded",
      service: "Snacksy Cafe And Restro CRM",
      timestamp: new Date().toISOString(),
      timezone: "Asia/Kathmandu",
      currency: "NPR",
      database: dbStatus,
    },
    { status: statusCode }
  );
}
