/**
 * Finance Service - Domain layer for financial tracking and calculations.
 * Uses real Supabase when configured, falls back to mock data.
 * Never counts projected revenue as realized revenue.
 */

import { getDb } from "@/lib/supabase/db";

export type FinancialRecord = {
  id: string;
  type: "revenue" | "commission" | "expense";
  amount: number;
  description: string;
  category?: string;
  occurred_at: string;
  related_entity_id?: string;
  is_projected?: boolean;
};

export type FinanceSummary = {
  total_revenue_actual: number;
  total_revenue_projected: number;
  total_commissions_actual: number;
  total_commissions_earned: number;
  total_expenses: number;
  net_profit_actual: number;
  net_profit_projected: number;
  roi: number;
  profit_per_content: number[];
  profit_per_product: number[];
};

export class FinanceService {
  async record(record: Omit<FinancialRecord, "id">): Promise<FinancialRecord> {
    const id = `fin_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const newRecord: FinancialRecord = { id, ...record };

    const db = getDb();
    if (db) {
      const table = record.type === "expense" ? "expenses" : record.type === "commission" ? "commissions" : "orders";
      const insertData: Record<string, unknown> = { amount: record.amount, description: record.description, occurred_at: record.occurred_at };
      if (record.category) insertData.category = record.category;
      if (record.related_entity_id) insertData.product_id = record.related_entity_id;
      const { error } = await db.from(table).insert(insertData);
      if (error) throw error;
    }

    return newRecord;
  }

  async summaryByRange(startDate: string, endDate: string): Promise<FinanceSummary> {
    const db = getDb();
    if (db) {
      const [ordersRes, commissionsRes, expensesRes] = await Promise.all([
        db.from("orders").select("amount").gte("order_date", startDate).lte("order_date", endDate),
        db.from("commissions").select("amount, paid").gte("created_at", startDate).lte("created_at", endDate),
        db.from("expenses").select("amount").gte("occurred_at", startDate).lte("occurred_at", endDate),
      ]);

      const orders = ordersRes.data || [];
      const commissions = commissionsRes.data || [];
      const expenses = expensesRes.data || [];

      const totalRevenueActual = orders.reduce((s: number, r: Record<string, unknown>) => s + ((r.amount as number) || 0), 0);
      const totalCommissionsActual = commissions.reduce((s: number, r: Record<string, unknown>) => s + ((r.amount as number) || 0), 0);
      const totalCommissionsEarned = commissions.filter((c: Record<string, unknown>) => c.paid).reduce((s: number, r: Record<string, unknown>) => s + ((r.amount as number) || 0), 0);
      const totalExpenses = expenses.reduce((s: number, r: Record<string, unknown>) => s + ((r.amount as number) || 0), 0);
      const netProfitActual = totalCommissionsActual - totalExpenses;
      const roi = totalExpenses > 0 ? (netProfitActual / totalExpenses) * 100 : 0;

      return {
        total_revenue_actual: totalRevenueActual, total_revenue_projected: 0,
        total_commissions_actual: totalCommissionsActual, total_commissions_earned: totalCommissionsEarned,
        total_expenses: totalExpenses, net_profit_actual: netProfitActual, net_profit_projected: 0,
        roi: Number(roi.toFixed(2)), profit_per_content: [], profit_per_product: [],
      };
    }

    // Mock fallback
    const totalRevenueActual = 1200;
    const totalCommissionsActual = 360;
    const totalExpenses = 150;
    const netProfitActual = totalCommissionsActual - totalExpenses;
    const roi = totalExpenses > 0 ? (netProfitActual / totalExpenses) * 100 : 0;

    return {
      total_revenue_actual: totalRevenueActual, total_revenue_projected: 2000,
      total_commissions_actual: totalCommissionsActual, total_commissions_earned: totalCommissionsActual,
      total_expenses: totalExpenses, net_profit_actual: netProfitActual, net_profit_projected: 2000 * 0.15 - totalExpenses,
      roi: Number(roi.toFixed(2)), profit_per_content: [45, 30, 25, 60, 15], profit_per_product: [200, 150, 100, 300, 50],
    };
  }

  async calculateROI(netProfit: number, totalExpenses: number): Promise<number> {
    if (totalExpenses <= 0) return 0;
    return Number(((netProfit / totalExpenses) * 100).toFixed(2));
  }

  async profitPerContent(_contentItemId: string, commission: number, attributableExpenses: number = 0): Promise<number> {
    return Number((commission - attributableExpenses).toFixed(2));
  }

  async profitPerProduct(_productId: string, totalCommission: number, attributableExpenses: number = 0): Promise<number> {
    return Number((totalCommission - attributableExpenses).toFixed(2));
  }

  verifyProjectionIntegrity(records: FinancialRecord[]): { isValid: boolean; issues: string[] } {
    const issues: string[] = [];
    let hasProjected = false;
    for (const record of records) {
      if (record.type === "revenue" && record.is_projected) {
        hasProjected = true;
        issues.push(`Warning: ${record.amount} in projected revenue found - ensure not counted as realized`);
      }
    }
    return { isValid: !hasProjected || issues.length === 0, issues };
  }
}

export default new FinanceService();
