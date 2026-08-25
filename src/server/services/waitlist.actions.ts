"use server";

import { addWaitlistEntry, updateWaitlistStatus } from "./waitlist.service";

export async function addWaitlistEntryAction(data: Parameters<typeof addWaitlistEntry>[0]) {
  return addWaitlistEntry(data);
}

export async function updateWaitlistStatusAction(entryId: string, targetStatus: "NOTIFIED" | "SEATED" | "CANCELLED" | "LEFT") {
  return updateWaitlistStatus(entryId, targetStatus);
}
