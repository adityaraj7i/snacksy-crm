"use server";

import { createCustomer, mergeCustomers, findLikelyDuplicates, addCustomerNote, recordConsentEvent } from "./customer.service";

export async function createCustomerAction(data: Parameters<typeof createCustomer>[0]) {
  return createCustomer(data);
}

export async function mergeCustomersAction(primaryId: string, duplicateId: string) {
  return mergeCustomers(primaryId, duplicateId);
}

export async function findLikelyDuplicatesAction(phone: string, email?: string) {
  return findLikelyDuplicates(phone, email);
}

export async function addCustomerNoteAction(customerId: string, content: string, category?: string, pinned?: boolean) {
  return addCustomerNote(customerId, content, category, pinned);
}

export async function recordConsentEventAction(customerId: string, channel: "SMS" | "EMAIL" | "WHATSAPP", granted: boolean, source?: string) {
  return recordConsentEvent(customerId, channel, granted, source);
}
