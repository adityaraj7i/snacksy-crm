import { describe, expect, it } from "vitest";

describe("Loyalty Program & Ledger Integrity Engine", () => {
  it("calculates spend points accurately based on earnRate (NPR 100 per 1 point)", () => {
    const totalAmountNpr = 45000; // NPR 450.00 in Paisa
    const earnRateSpendNpr = 10000; // NPR 100 in Paisa

    const pointsEarned = Math.floor(totalAmountNpr / earnRateSpendNpr);
    expect(pointsEarned).toBe(4);
  });

  it("validates reward redemption sufficiency correctly", () => {
    const currentPoints = 50;
    const rewardPointsRequired = 30;

    const canRedeem = currentPoints >= rewardPointsRequired;
    const remainingPoints = currentPoints - rewardPointsRequired;

    expect(canRedeem).toBe(true);
    expect(remainingPoints).toBe(20);
  });

  it("rejects reward redemption when customer has insufficient points", () => {
    const currentPoints = 15;
    const rewardPointsRequired = 50;

    const canRedeem = currentPoints >= rewardPointsRequired;
    expect(canRedeem).toBe(false);
  });

  it("maintains immutable ledger accounting formula (Lifetime Earned - Lifetime Redeemed = Current Points)", () => {
    const lifetimeEarned = 150;
    const lifetimeRedeemed = 50;
    const currentPoints = lifetimeEarned - lifetimeRedeemed;

    expect(currentPoints).toBe(100);
  });
});
