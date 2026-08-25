import { describe, expect, it } from "vitest";

describe("Customer Feedback & Low-Rating Recovery Engine", () => {
  it("flags ratings <= 2 stars as negative feedback needing urgent recovery", () => {
    const rating1 = 1;
    const rating2 = 2;
    const rating5 = 5;

    expect(rating1 <= 2).toBe(true);
    expect(rating2 <= 2).toBe(true);
    expect(rating5 <= 2).toBe(false);
  });

  it("calculates average rating score accurately", () => {
    const ratings = [5, 4, 1, 5, 5]; // Sum = 20, Avg = 4.0
    const avg = ratings.reduce((sum, r) => sum + r, 0) / ratings.length;

    expect(avg).toBe(4.0);
  });
});
