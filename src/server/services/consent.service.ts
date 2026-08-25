import { db } from "@/server/db/client";
import { logger } from "@/server/lib/logger";

export interface ConsentCheckResult {
  allowed: boolean;
  destination?: string;
  reason?: string;
}

export async function validateCustomerChannelConsent(
  customerId: string,
  channel: "EMAIL" | "SMS" | "WHATSAPP"
): Promise<ConsentCheckResult> {
  const customer = await db.customer.findUnique({
    where: { id: customerId },
    include: { preferences: true },
  });

  if (!customer || customer.status !== "ACTIVE") {
    return { allowed: false, reason: "Customer profile is inactive or non-existent." };
  }

  const prefs = customer.preferences;
  if (!prefs) {
    return { allowed: false, reason: "Customer preference ledger missing." };
  }

  if (channel === "EMAIL") {
    if (!prefs.marketingOptInEmail) {
      return { allowed: false, reason: "Customer has opted out of Email marketing." };
    }
    if (!customer.email || !customer.email.includes("@")) {
      return { allowed: false, reason: "Invalid or missing destination email address." };
    }
    return { allowed: true, destination: customer.email };
  }

  if (channel === "SMS") {
    if (!prefs.marketingOptInSms) {
      return { allowed: false, reason: "Customer has opted out of SMS marketing." };
    }
    if (!customer.phone) {
      return { allowed: false, reason: "Missing destination mobile phone number." };
    }
    return { allowed: true, destination: customer.phone };
  }

  if (channel === "WHATSAPP") {
    if (!prefs.marketingOptInWhatsApp) {
      return { allowed: false, reason: "Customer has opted out of WhatsApp marketing." };
    }
    const destination = customer.whatsAppNumber || customer.phone;
    if (!destination) {
      return { allowed: false, reason: "Missing destination WhatsApp phone number." };
    }
    return { allowed: true, destination };
  }

  return { allowed: false, reason: "Unsupported marketing channel." };
}
