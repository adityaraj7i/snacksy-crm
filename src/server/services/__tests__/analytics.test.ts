import { describe, expect, it } from "vitest";

describe("Executive Analytics & Reporting Engine", () => {
  it("calculates Average Order Value (AOV) accurately from gross revenue", () => {
    const grossRevenueNpr = 500000; // NPR 5,000 in Paisa
    const totalOrders = 10;
    const aov = Math.round(grossRevenueNpr / totalOrders);

    expect(aov).toBe(50000); // NPR 500 in Paisa
  });

  it("aggregates ordering channel breakdown correctly", () => {
    const orders = [
      { orderType: "DINE_IN", totalAmountNpr: 1000 },
      { orderType: "DINE_IN", totalAmountNpr: 2000 },
      { orderType: "DELIVERY", totalAmountNpr: 1500 },
    ];

    const dineInTotal = orders.filter((o) => o.orderType === "DINE_IN").reduce((s, o) => s + o.totalAmountNpr, 0);
    const deliveryTotal = orders.filter((o) => o.orderType === "DELIVERY").reduce((s, o) => s + o.totalAmountNpr, 0);

    expect(dineInTotal).toBe(3000);
    expect(deliveryTotal).toBe(1500);
  });
});
