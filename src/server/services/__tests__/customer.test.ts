import { describe, expect, it } from "vitest";
import { normalizePhoneNumber } from "@/lib/phone";
import { normalizeEmail } from "@/lib/email";

describe("Customer CRM Normalization & Utility Engines", () => {
  it("normalizes standard 10-digit Nepal mobile numbers to E.164 (+977)", () => {
    expect(normalizePhoneNumber("9841234567")).toBe("+9779841234567");
    expect(normalizePhoneNumber("9741234567")).toBe("+9779741234567");
  });

  it("handles Nepal phone numbers with +977 or 977 prefixes correctly", () => {
    expect(normalizePhoneNumber("+9779841234567")).toBe("+9779841234567");
    expect(normalizePhoneNumber("9779841234567")).toBe("+9779841234567");
  });

  it("normalizes Nepal landline numbers (01-4234567) to E.164 (+97714234567)", () => {
    expect(normalizePhoneNumber("01-4234567")).toBe("+97714234567");
  });

  it("preserves international phone numbers with valid country codes", () => {
    expect(normalizePhoneNumber("+14155552671")).toBe("+14155552671");
    expect(normalizePhoneNumber("+442079460912")).toBe("+442079460912");
  });

  it("safely normalizes email addresses by trimming and lowercasing", () => {
    expect(normalizeEmail("  Aarav.Sharma@Example.COM  ")).toBe("aarav.sharma@example.com");
    expect(normalizeEmail("invalid-email")).toBeNull();
    expect(normalizeEmail("")).toBeNull();
  });
});
