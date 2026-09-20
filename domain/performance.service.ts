/**
 * Performance Service - Domain layer for content performance tracking.
 * Uses real Supabase when configured, falls back to mock data.
 */

import { getDb } from "@/lib/supabase/db";

export type PerformanceMetrics = {
  content_item_id: string;
  views: number;
  watch_time: number;
  retention: number;
  likes: number;
  comments: number;
  shares: number;
  saves: number;
  profile_visits: number;
  clicks: number;
  orders: number;
  commission: number;
  ctr: number;
  cvr: number;
  earnings_per_1k_views: number;
  profit_per_content: number;
};

export type PerformanceAnalysis = {
  content_item_id: string;
  what_worked: string[];
  what_underperformed: string[];
  hypotheses: string[];
  recommended_experiments: string[];
  overall_grade: "A" | "B" | "C" | "D" | "F";
};

export class PerformanceService {
  async record(metrics: Omit<PerformanceMetrics, "ctr" | "cvr" | "earnings_per_1k_views" | "profit_per_content">): Promise<PerformanceMetrics> {
    const views = metrics.views;
    const clicks = metrics.clicks;
    const orders = metrics.orders;
    const commission = metrics.commission;
    const ctr = views > 0 ? Math.min(100, (clicks / views) * 100) : 0;
    const cvr = clicks > 0 ? Math.min(100, (orders / clicks) * 100) : 0;
    const earningsPer1k = views > 0 ? (commission / views) * 1000 : 0;

    const newMetrics: PerformanceMetrics = {
      ...metrics, ctr: Number(ctr.toFixed(2)), cvr: Number(cvr.toFixed(2)),
      earnings_per_1k_views: Number(earningsPer1k.toFixed(2)), profit_per_content: Number(commission.toFixed(2)),
    };

    const db = getDb();
    if (db) {
      const { error } = await db.from("content_performance").insert({
        content_item_id: newMetrics.content_item_id, views: newMetrics.views,
        watch_time: newMetrics.watch_time, retention: newMetrics.retention,
        likes: newMetrics.likes, comments: newMetrics.comments, shares: newMetrics.shares,
        saves: newMetrics.saves, profile_visits: newMetrics.profile_visits,
        clicks: newMetrics.clicks, orders: newMetrics.orders, commission: newMetrics.commission,
        ctr: newMetrics.ctr, cvr: newMetrics.cvr,
        earnings_per_1k_views: newMetrics.earnings_per_1k_views, profit_per_content: newMetrics.profit_per_content,
      });
      if (error) throw error;
    }

    return newMetrics;
  }

  async analyze(metrics: PerformanceMetrics): Promise<PerformanceAnalysis> {
    const what_worked: string[] = [];
    const what_underperformed: string[] = [];
    const hypotheses: string[] = [];
    const recommended_experiments: string[] = [];

    if (metrics.ctr > 5) what_worked.push(`Strong CTR of ${metrics.ctr}%`);
    else if (metrics.ctr < 1) { what_underperformed.push(`Low CTR of ${metrics.ctr}%`); recommended_experiments.push("A/B test different thumbnails"); }
    if (metrics.cvr > 3) what_worked.push(`Strong CVR of ${metrics.cvr}%`);
    else if (metrics.cvr < 0.5) { what_underperformed.push(`Low CVR of ${metrics.cvr}%`); recommended_experiments.push("A/B test different CTAs"); }
    if (metrics.retention > 60) what_worked.push(`High retention ${metrics.retention}%`);
    else if (metrics.retention < 30) { what_underperformed.push(`Low retention ${metrics.retention}%`); hypotheses.push("Shorter videos may help"); }

    const totalEngagement = metrics.likes + metrics.comments + metrics.shares + metrics.saves;
    if (totalEngagement > metrics.views * 0.1) what_worked.push("Strong engagement");
    if (metrics.commission > 100) what_worked.push(`Good earnings: $${metrics.commission}`);
    if (metrics.profile_visits > 0) what_worked.push(`${metrics.profile_visits} profile visits`);

    return {
      content_item_id: metrics.content_item_id, what_worked, what_underperformed,
      hypotheses, recommended_experiments, overall_grade: this.calculateGrade(metrics),
    };
  }

  private calculateGrade(m: PerformanceMetrics): "A" | "B" | "C" | "D" | "F" {
    const ctrScore = Math.min(1, m.ctr / 5);
    const cvrScore = Math.min(1, m.cvr / 3);
    const retentionScore = Math.min(1, m.retention / 60);
    const totalEngagement = m.likes + m.comments + m.shares + m.saves;
    const engagementScore = Math.min(1, m.views > 0 ? totalEngagement / (m.views * 0.1) : 0);
    const score = ctrScore * 0.3 + cvrScore * 0.3 + retentionScore * 0.2 + engagementScore * 0.2;
    if (score >= 0.8) return "A";
    if (score >= 0.6) return "B";
    if (score >= 0.4) return "C";
    if (score >= 0.2) return "D";
    return "F";
  }
}

export default new PerformanceService();
