import { describe, expect, it } from "vitest";
import { hashPassword, verifyPassword, generateRandomToken, hashToken } from "../passwords";
import { checkRateLimit, resetRateLimit } from "../rate-limiter";

describe("Password Security & Rate Limiting", () => {
  it("hashes and verifies passwords correctly using bcrypt", async () => {
    const rawPassword = "SnacksySecret123!";
    const hash = await hashPassword(rawPassword);

    expect(hash).not.toBe(rawPassword);
    expect(await verifyPassword(rawPassword, hash)).toBe(true);
    expect(await verifyPassword("WrongPassword", hash)).toBe(false);
  });

  it("generates random tokens and produces consistent SHA-256 hashes", () => {
    const token = generateRandomToken(16);
    expect(token).toHaveLength(32);

    const hash1 = hashToken(token);
    const hash2 = hashToken(token);

    expect(hash1).toBe(hash2);
    expect(hash1).toHaveLength(64);
  });

  it("enforces rate limits on brute-force attempts", () => {
    const ip = "192.168.1.100";
    resetRateLimit(ip);

    for (let i = 0; i < 5; i++) {
      const result = checkRateLimit(ip, 5, 60000);
      expect(result.success).toBe(true);
    }

    const blockedResult = checkRateLimit(ip, 5, 60000);
    expect(blockedResult.success).toBe(false);
    expect(blockedResult.remaining).toBe(0);
  });
});
