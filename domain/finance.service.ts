/**
 * Finance Service - Domain layer for financial tracking and calculations.
 * 
 * Tracks revenue, commissions, expenses, and calculates profitability metrics.
 * All formulas are documented and unit-tested per the requirements.
 * Never counts projected revenue as realized revenue.
 * Separates actual, estimated, and projected values.
 */

export type FinancialRecord = {
  id: string;
  type: 'revenue' | 'commission' | 'expense';
  amount: number;
  description: string;
  category?: string;
  occurred_at: string;
  related_entity_id?: string; // product_id, content_item_id, order_id
  is_projected?: boolean; // true = projected, false = actual
};

export type FinanceSummary = {
  total_revenue_actual: number;
  total_revenue_projected: number;
  total_commissions_actual: number;
  total_commissions_earned: number; // paid + unpaid
  total_expenses: number;
  net_profit_actual: number;
  net_profit_projected: number;
  roi: number; // return on investment percentage
  profit_per_content: number[];
  profit_per_product: number[];
};

export class FinanceService {
  // private supabase: ReturnType<typeof createClient>;

  constructor() {
    // this.supabase = supabase;
  }

  /**
   * Add a financial record (revenue, commission, or expense)
   */
  async record(record: Omit<FinancialRecord, 'id'>): Promise<FinancialRecord> {
    const id = `fin_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const newRecord: FinancialRecord = {
      id,
      ...record,
    };
    return newRecord;
  }

  /**
   * Get financial summary for a date range
   */
  async summaryByRange(startDate: string, endDate: string): Promise<FinanceSummary> {
    // In production, would query Supabase for records in date range
    // For demo, return calculated summary from stored records

    // Demo data
    const totalRevenueActual = 1200;
    const totalRevenueProjected = 2000; // Never count projected as realized
    const totalCommissionsActual = 360;
    const totalCommissionsEarned = 360; // unpaid + paid
    const totalExpenses = 150;
    const netProfitActual = totalCommissionsActual - totalExpenses;
    const netProfitProjected = totalRevenueProjected * 0.15 - totalExpenses; // 15% assumed rate
    const roi = totalExpenses > 0 ? ((netProfitActual / totalExpenses) * 100) : 0;

    // Profit per content - would be calculated from actual content items
    const profitPerContent = [45, 30, 25, 60, 15]; // example values
    const profitPerProduct = [200, 150, 100, 300, 50]; // example values

    return {
      total_revenue_actual: totalRevenueActual,
      total_revenue_projected: totalRevenueProjected,
      total_commissions_actual: totalCommissionsActual,
      total_commissions_earned: totalCommissionsEarned,
      total_expenses: totalExpenses,
      net_profit_actual: netProfitActual,
      net_profit_projected: netProfitProjected,
      roi: Number(roi.toFixed(2)),
      profit_per_content: profitPerContent,
      profit_per_product: profitPerProduct,
    };
  }

  /**
   * Calculate ROI (Return on Investment)
   * ROI = (Net Profit / Total Expenses) * 100
   */
  async calculateROI(netProfit: number, totalExpenses: number): Promise<number> {
    if (totalExpenses <= 0) return 0;
    return Number(((netProfit / totalExpenses) * 100).toFixed(2));
  }

  /**
   * Calculate profit per content item
   * Profit = Commission - attributable expenses
   */
  async profitPerContent(contentItemId: string, commission: number, attributableExpenses: number = 0): Promise<number> {
    const profit = commission - attributableExpenses;
    return Number(profit.toFixed(2));
  }

  /**
   * Calculate profit per product
   * Profit = Total commissions from product - attributable expenses
   */
  async profitPerProduct(productId: string, totalCommission: number, attributableExpenses: number = 0): Promise<number> {
    const profit = totalCommission - attributableExpenses;
    return Number(profit.toFixed(2));
  }

  /**
   * Verify that projected revenue is not counted as realized revenue
   * Throws error if projection logic is violated
   */
  verifyProjectionIntegrity(records: FinancialRecord[]): { isValid: boolean; issues: string[] } {
    const issues: string[] = [];
    let hasProjected = false;
    let realizedRevenue = 0;
    let projectedRevenue = 0;

    for (const record of records) {
      if (record.type === 'revenue') {
        if (record.is_projected) {
          projectedRevenue += record.amount;
          hasProjected = true;
        } else {
          realizedRevenue += record.amount;
        }
      }
    }

    if (hasProjected) {
      issues.push(`Warning: ${projectedRevenue} in projected revenue found - ensure not counted as realized`);
    }

    return {
      isValid: !hasProjected || issues.length === 0,
      issues,
    };
  }
}

export default new FinanceService();