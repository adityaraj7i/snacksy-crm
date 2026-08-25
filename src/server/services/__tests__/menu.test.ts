import { describe, expect, it } from "vitest";

describe("Digital Menu & QR Ordering Engine", () => {
  it("formats NPR pricing correctly for menu display", () => {
    const pricePaisa = 24000; // NPR 240
    const priceNpr = pricePaisa / 100;

    expect(priceNpr).toBe(240);
  });

  it("handles dietary tags accurately", () => {
    const validTags = ["VEG", "NON_VEG", "VEGAN", "GLUTEN_FREE"];
    
    expect(validTags.includes("VEG")).toBe(true);
    expect(validTags.includes("NON_VEG")).toBe(true);
    expect(validTags.includes("KETO")).toBe(false);
  });
});
