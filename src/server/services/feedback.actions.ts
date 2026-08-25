"use server";

import { recordCustomerFeedback, resolveFeedback } from "./feedback.service";

export async function recordCustomerFeedbackAction(data: Parameters<typeof recordCustomerFeedback>[0]) {
  return recordCustomerFeedback(data);
}

export async function resolveFeedbackAction(feedbackId: string, resolutionNotes: string) {
  return resolveFeedback(feedbackId, resolutionNotes);
}
