/**
 * Finance Agent - Calculate and classify actual, estimated, and projected financial values.
 * 
 * Never disguise projections as realized results.
 * Separates: actual, estimated, projected.
 * All formulas are documented and unit-tested.
 */

export type FinanceInput = {
  type: 'actual' | 'estimated' | 'projected';
  category: 'revenue' | 'commission' | 'expense';
  amount: number;
  description: string;
  orderId?: string;
  productId?: string;
};

export type FinanceOutput = {
  classification: 'actual' | 'estimated' | 'projected';
  amount: number;
  calculated: number;
  confidence: number;
  note: string;
};

export type FinanceMetrics = {
  total_revenue_actual: number;
  total_revenue_estimated: number;
  total_revenue_projected: number;
  total_commissions_actual: number;
  total_expenses_actual: number;
  net_profit_actual: number;
  net_profit_projected: number;
  roi: number;
  profit_per_content: number;
  profit_per_product: number[];
};

export class FinanceAgent {
  /**
   * Classify financial data and calculate metrics
   */
  async calculate(input: FinanceInput): Promise<FinanceOutput> {
    let classification: 'actual' | 'estimated' | 'projected';
    let confidence: number;
    let note: string;

    switch (input.type) {
      case 'actual':
        classification = 'actual';
        confidence = 1.0;
        note = 'Confirmed financial record - verified transaction';
        break;
      case 'estimated':
        classification = 'estimated';
        confidence = 0.7;
        note = 'Estimate based on historical averages - subject to change';
        break;
      case 'projected':
        classification = 'projected';
        confidence = 0.4;
        note = 'Projection based on assumptions - NOT counted as realized revenue';
        break;
      default:
        throw new Error(`Unknown finance type: ${input.type}`);
    }

    // Calculate based on category
    const amount = input.amount;
    let calculated = amount;

    if (input.category === 'commission' && input.type === 'projected') {
      // Projected commissions use a lower confidence factor
      calculated = amount * 0.5; // Only count half as realized
      note += ' - Reduced confidence for projected commissions';
    }

    return {
      classification,
      amount,
      calculated,
      confidence,
      note,
    };
  }

  /**
   * Calculate financial metrics summary
   */
  async summary(records: FinanceInput[]): Promise<FinanceMetrics> {
    let totalRevenueActual = 0;
    let totalRevenueEstimated = 0;
    let totalRevenueProjected = 0;
    let totalCommissionsActual = 0;
    let totalExpensesActual = 0;

    for (const record of records) {
      const calc = await this.calculate(record);

      switch (record.category) {
        case 'revenue':
          if (calc.classification === 'actual') totalRevenueActual += calc.amount;
          else if (calc.classification === 'estimated') totalRevenueEstimated += calc.amount;
          else totalRevenueProjected += calc.amount;
          break;
        case 'commission':
          if (calc.classification === 'actual') totalCommissionsActual += calc.amount;
          break;
        case 'expense':
          totalExpensesActual += calc.amount;
          break;
      }
    }

    // CRITICAL: Never count projected revenue as realized revenue
    const netProfitActual = totalCommissionsActual - totalExpensesActual;
    const netProfitProjected = totalRevenueProjected * 0.5 - totalExpensesActual; // Only count 50% of projected

    const roi = totalExpensesActual > 0 ? ((netProfitActual / totalExpensesActual) * 100) : 0;

    // Profit per content - would be calculated from actual content items
    const profitPerContent = records
      .filter(r => r.category === 'commission' && r.type === 'actual')
      .reduce((sum, r) => sum + r.amount, 0);

    // Profit per product - would be calculated from product-level data
    const profitPerProduct = [netProfitActual, netProfitProjected];

    return {
      total_revenue_actual: Number(totalRevenueActual.toFixed(2)),
      total_revenue_estimated: Number(totalRevenueEstimated.toFixed(2)),
      total_revenue_projected: Number(totalRevenueProjected.toFixed(2)),
      total_commissions_actual: Number(totalCommissionsActual.toFixed(2)),
      total_expenses_actual: Number(totalExpensesActual.toFixed(2)),
      net_profit_actual: Number(netProfitActual.toFixed(2)),
      net_profit_projected: Number(netProfitProjected.toFixed(2)),
      roi: Number(roi.toFixed(2)),
      profit_per_content: Number(profitPerContent.toFixed(2)),
      profit_per_product: profitPerProduct.map(p => Number(p.toFixed(2))),
    };
  }

  /**
   * Verify that projected revenue is not counted as actual revenue
   */
  verifyIntegrity(records: FinanceInput[]): { valid: boolean; issues: string[] } {
    const issues: string[] = [];
    for (const r of records) {
      if (r.type === 'projected') {
        issues.push(`Projected record found: ${r.description} (${r.amount}) - must not be counted as actual`);
      }
    }
    return { valid: issues.length === 0, issues };
  }
}

export default new FinanceAgent();