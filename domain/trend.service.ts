/**
 * Trend Service - Domain layer for trend-related operations.
 * Uses real Supabase when configured, falls back to mock data.
 */

import { getDb } from "@/lib/supabase/db";

export type TrendSignal = {
  id: string;
  keyword: string;
  source: string;
  signal_score: number;
  trend_data: { historical_volume: number; recent_change_pct: number; peak_period: string };
  recorded_at: string;
  limitations: string;
};

export type TrendSummary = {
  keyword: string;
  overall_direction: "up" | "down" | "stable";
  confidence: number;
  related_products: string[];
};

export class TrendService {
  async record(signal: Omit<TrendSignal, "id" | "recorded_at">): Promise<TrendSignal> {
    const id = `trend_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const record: TrendSignal = { id, ...signal, recorded_at: new Date().toISOString() };

    const db = getDb();
    if (db) {
      const { error } = await db.from("trends").insert(record);
      if (error) throw error;
    }
    return record;
  }

  async getByKeyword(keyword: string, options: { limit?: number; minScore?: number } = {}): Promise<TrendSignal[]> {
    const db = getDb();
    if (db) {
      let query = db.from("trends").select("*").ilike("keyword", `%${keyword}%`);
      if (options.minScore) query = query.gte("signal_score", options.minScore);
      query = query.order("recorded_at", { ascending: false }).limit(options.limit ?? 10);
      const { data, error } = await query;
      if (error) throw error;
      return (data as TrendSignal[]) || [];
    }
    return [];
  }

  async summarize(): Promise<TrendSummary[]> {
    const db = getDb();
    if (db) {
      const { data, error } = await db.from("trends").select("keyword, signal_score, product_id");
      if (error) throw error;
      const byKeyword = new Map<string, { scores: number[]; products: Set<string> }>();
      for (const row of (data || []) as Record<string, unknown>[]) {
        const kw = row.keyword as string;
        if (!byKeyword.has(kw)) byKeyword.set(kw, { scores: [], products: new Set() });
        const entry = byKeyword.get(kw)!;
        entry.scores.push(row.signal_score as number);
        if (row.product_id) entry.products.add(row.product_id as string);
      }
      return Array.from(byKeyword.entries()).map(([keyword, { scores, products }]) => ({
        keyword,
        overall_direction: scores.reduce((a, b) => a + b, 0) / scores.length > 0 ? "up" : "down",
        confidence: Math.abs(scores.reduce((a, b) => a + b, 0) / scores.length),
        related_products: Array.from(products),
      }));
    }

    return [
      { keyword: "AI productivity tools", overall_direction: "up", confidence: 0.78, related_products: ["prod_2"] },
      { keyword: "affiliate marketing AI", overall_direction: "up", confidence: 0.65, related_products: ["prod_1"] },
    ];
  }

  async isTrending(keyword: string, threshold: number = 0.5): Promise<boolean> {
    const trends = await this.getByKeyword(keyword, { minScore: threshold });
    return trends.length > 0;
  }
}

export default new TrendService();
