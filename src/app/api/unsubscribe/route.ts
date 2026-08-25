import { NextResponse } from "next/server";
import { db } from "@/server/db/client";
import { logger } from "@/server/lib/logger";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const customerId = searchParams.get("customerId");
  const channel = (searchParams.get("channel") || "EMAIL").toUpperCase();

  if (!customerId) {
    return NextResponse.json({ error: "Missing customerId parameter." }, { status: 400 });
  }

  try {
    const customer = await db.customer.findUnique({
      where: { id: customerId },
    });

    if (!customer) {
      return NextResponse.json({ error: "Customer not found." }, { status: 404 });
    }

    // Update Preference & Log Consent Event
    await db.$transaction(async (tx) => {
      if (channel === "EMAIL") {
        await tx.customerPreference.updateMany({
          where: { customerId },
          data: { marketingOptInEmail: false },
        });
      } else if (channel === "SMS") {
        await tx.customerPreference.updateMany({
          where: { customerId },
          data: { marketingOptInSms: false },
        });
      } else if (channel === "WHATSAPP") {
        await tx.customerPreference.updateMany({
          where: { customerId },
          data: { marketingOptInWhatsApp: false },
        });
      }

      await tx.consentEvent.create({
        data: {
          customerId,
          channel: channel as any,
          granted: false,
          source: "UNSUBSCRIBE_LINK",
        },
      });
    });

    logger.info("Customer unsubscribed from channel", { customerId, channel });

    return new NextResponse(
      `<html>
        <body style="font-family: sans-serif; text-align: center; padding: 50px;">
          <h2>Unsubscribe Confirmed</h2>
          <p>You have successfully unsubscribed from <strong>${channel}</strong> marketing communications from Snacksy Cafe And Restro.</p>
        </body>
      </html>`,
      { headers: { "Content-Type": "text/html" } }
    );
  } catch (err: any) {
    logger.error("Unsubscribe handler failed", { error: err.message });
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
