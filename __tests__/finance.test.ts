import { describe, it, expect } from "vitest";
import FinanceAgent from "../agents/finance.agent";

describe("FinanceAgent", () => {
  it("calculates ROI as (profit/expenses)*100", async () => {
    const summary = await FinanceAgent.summary([
      { type: "actual", category: "commission", amount: 360, description: "commissions" },
      { type: "actual", category: "expense", amount: 150, description: "ads" },
    ]);
    // net = 360-150 = 210, roi = 210/150*100 = 140
    expect(summary.net_profit_actual).toBe(210);
    expect(summary.roi).toBe(140);
  });

  it("never counts projected revenue as realized", async () => {
    const summary = await FinanceAgent.summary([
      { type: "projected", category: "revenue", amount: 2000, description: "projection" },
      { type: "actual", category: "commission", amount: 100, description: "commissions" },
    ]);
    expect(summary.total_revenue_actual).toBe(0);
    expect(summary.total_revenue_projected).toBe(2000);
    expect(summary.net_profit_actual).toBe(100);
  });
});
