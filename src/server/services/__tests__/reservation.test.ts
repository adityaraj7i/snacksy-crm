import { describe, expect, it } from "vitest";
import { ALLOWED_STATUS_TRANSITIONS } from "../reservation.service";

describe("Reservation Lifecycle & State Machine Validation", () => {
  it("allows valid state transitions: PENDING -> CONFIRMED -> SEATED -> COMPLETED", () => {
    expect(ALLOWED_STATUS_TRANSITIONS["PENDING"]).toContain("CONFIRMED");
    expect(ALLOWED_STATUS_TRANSITIONS["CONFIRMED"]).toContain("SEATED");
    expect(ALLOWED_STATUS_TRANSITIONS["SEATED"]).toContain("COMPLETED");
  });

  it("allows marking CONFIRMED booking as NO_SHOW or CANCELLED", () => {
    expect(ALLOWED_STATUS_TRANSITIONS["CONFIRMED"]).toContain("NO_SHOW");
    expect(ALLOWED_STATUS_TRANSITIONS["CONFIRMED"]).toContain("CANCELLED");
  });

  it("disallows invalid transitions from terminal statuses (COMPLETED, CANCELLED, NO_SHOW)", () => {
    expect(ALLOWED_STATUS_TRANSITIONS["COMPLETED"]).toHaveLength(0);
    expect(ALLOWED_STATUS_TRANSITIONS["CANCELLED"]).toHaveLength(0);
    expect(ALLOWED_STATUS_TRANSITIONS["NO_SHOW"]).toHaveLength(0);
  });

  it("detects time duration overlaps accurately", () => {
    const res1Start = new Date("2026-08-25T14:00:00.000Z");
    const durationMin = 90;
    const res1End = new Date(res1Start.getTime() + durationMin * 60 * 1000); // 15:30:00

    const testConflictingStart = new Date("2026-08-25T14:30:00.000Z"); // Overlaps!
    const testNonConflictingStart = new Date("2026-08-25T16:00:00.000Z"); // No overlap

    const isOverlap = (start: Date, duration: number) => {
      const end = new Date(start.getTime() + duration * 60 * 1000);
      return start < res1End && end > res1Start;
    };

    expect(isOverlap(testConflictingStart, 90)).toBe(true);
    expect(isOverlap(testNonConflictingStart, 90)).toBe(false);
  });
});
