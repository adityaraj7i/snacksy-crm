"use server";

import { createReservation, updateReservationStatus } from "./reservation.service";

export async function createReservationAction(data: Parameters<typeof createReservation>[0]) {
  return createReservation(data);
}

export async function updateReservationStatusAction(reservationId: string, targetStatus: string) {
  return updateReservationStatus(reservationId, targetStatus);
}
