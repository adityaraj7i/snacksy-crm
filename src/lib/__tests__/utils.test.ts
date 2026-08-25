import { describe, expect, it } from "vitest";
import { formatCurrencyNPR, formatNepalPhoneNumber } from "../utils";

describe("Utility Functions", () => {
  it("formats currency in NPR with paisa conversion correctly", () => {
    // 1000 paisa = 10 NPR
    const formatted = formatCurrencyNPR(1000);
    expect(formatted).toBe("रू 10.00");
  });

  it("normalizes Nepal phone numbers with +977 prefix", () => {
    expect(formatNepalPhoneNumber("9841234567")).toBe("+9779841234567");
    expect(formatNepalPhoneNumber("+9779841234567")).toBe("+9779841234567");
  });
});
