/**
 * Performance Service - Domain layer for content performance tracking and analysis.
 * 
 * Tracks metrics, calculates derived metrics (CTR, CVR, earnings per 1k views, etc.),
 * and provides analysis for the Evaluator agent.
 */

export type PerformanceMetrics = {
  content_item_id: string;
  views: number;
  watch_time: number; // in minutes or seconds depending on platform
  retention: number; // percentage 0-1
  likes: number;
  comments: number;
  shares: number;
  saves: number;
  profile_visits: number;
  clicks: number;
  orders: number;
  commission: number;
  ctr: number; // click-through rate, percentage
  cvr: number; // conversion rate, percentage
  earnings_per_1k_views: number;
  profit_per_content: number;
};

export type PerformanceAnalysis = {
  content_item_id: string;
  what_worked: string[];
  what_underperformed: string[];
  hypotheses: string[];
  recommended_experiments: string[];
  overall_grade: 'A' | 'B' | 'C' | 'D' | 'F';
};

export class PerformanceService {
  // private supabase: ReturnType<typeof createClient>;

  constructor() {
    // this.supabase = supabase;
  }

  /**
   * Record performance data for a content item
   */
  async record(metrics: Omit<PerformanceMetrics, 'ctr' | 'cvr' | 'earnings_per_1k_views' | 'profit_per_content'>): Promise<PerformanceMetrics> {
    // Calculate derived metrics
    const views = metrics.views;
    const clicks = metrics.clicks;
    const orders = metrics.orders;
    const commission = metrics.commission;

    const ctr = views > 0 ? Math.min(100, (clicks / views) * 100) : 0;
    const cvr = clicks > 0 ? Math.min(100, (orders / clicks) * 100) : 0;
    const earningsPer1k = views > 0 ? (commission / views) * 1000 : 0;
    // Profit = revenue - (estimated expenses). For now, profit = commission
    const profitPerContent = commission;

    const newMetrics: PerformanceMetrics = {
      ...metrics,
      ctr: Number(ctr.toFixed(2)),
      cvr: Number(cvr.toFixed(2)),
      earnings_per_1k_views: Number(earningsPer1k.toFixed(2)),
      profit_per_content: Number(profitPerContent.toFixed(2)),
    };

    // In production, would save to Supabase
    return newMetrics;
  }

  /**
   * Analyze performance and generate insights
   */
  async analyze(metrics: PerformanceMetrics): Promise<PerformanceAnalysis> {
    const { what_worked, what_underperformed, hypotheses, recommended_experiments } = this.calculateInsights(metrics);

    const grade = this.calculateGrade(metrics);

    return {
      content_item_id: metrics.content_item_id,
      what_worked: what_worked,
      what_underperformed: what_underperformed,
      hypotheses: hypotheses,
      recommended_experiments: recommended_experiments,
      overall_grade: grade,
    };
  }

  private calculateInsights(metrics: PerformanceMetrics) {
    const { views, watch_time, retention, likes, comments, shares, saves, profile_visits, clicks, orders, commission } = metrics;
    const what_worked: string[] = [];
    const what_underperformed: string[] = [];
    const hypotheses: string[] = [];
    const recommended_experiments: string[] = [];

    // Analyze CTR
    if (metrics.ctr > 5) {
      what_worked.push(`Strong CTR of ${metrics.ctr}% - effective hook/thumbnail`);
    } else if (metrics.ctr < 1) {
      what_underperformed.push(`Low CTR of ${metrics.ctr}% - may need better thumbnail or hook`);
      hypotheses.push(`Testing improved thumbnails could increase CTR`);
      recommended_experiments.push('A/B test different thumbnail images');
    }

    // Analyze CVR
    if (metrics.cvr > 3) {
      what_worked.push(`Strong conversion rate of ${metrics.cvr}%`);
    } else if (metrics.cvr < 0.5) {
      what_underperformed.push(`Low conversion rate of ${metrics.cvr}%`);
      hypotheses.push(`The offer or landing page may not align with audience expectations`);
      recommended_experiments.push('A/B test different CTAs or landing pages');
    }

    // Analyze retention
    if (retention > 60) {
      what_worked.push(`High retention rate of ${retention}% - content is engaging`);
    } else if (retention < 30) {
      what_underperformed.push(`Low retention rate of ${retention}% - content may be losing interest`);
      hypotheses.push(`Shorter videos or stronger openings could improve retention`);
      recommended_experiments.push('Test shorter duration or different opening hooks');
    }

    // Analyze engagement
    const totalEngagement = likes + comments + shares + saves;
    if (totalEngagement > views * 0.1) {
      what_worked.push(`Strong engagement - audience is interacting`);
    }

    // Analyze profit
    if (commission > 100) {
      what_worked.push(`Good earnings - ${commission} commission generated`);
    }

    // If we have profile visits, that's a positive signal
    if (profile_visits > 0) {
      what_worked.push(`${profile_visits} profile visits - audience interested in the promoter`);
    }

    return { what_worked, what_underperformed, hypotheses, recommended_experiments };
  }

  private calculateGrade(metrics: PerformanceMetrics): 'A' | 'B' | 'C' | 'D' | 'F' {
    // Weighted composite: CTR 30%, CVR 30%, retention 20%, engagement 20%
    const ctrScore = Math.min(1, metrics.ctr / 5);
    const cvrScore = Math.min(1, metrics.cvr / 3);
    const retentionScore = Math.min(1, metrics.retention / 60);
    const totalEngagement = metrics.likes + metrics.comments + metrics.shares + metrics.saves;
    const engagementScore = Math.min(1, metrics.views > 0 ? totalEngagement / (metrics.views * 0.1) : 0);
    const score = ctrScore * 0.3 + cvrScore * 0.3 + retentionScore * 0.2 + engagementScore * 0.2;

    if (score >= 0.8) return 'A';
    if (score >= 0.6) return 'B';
    if (score >= 0.4) return 'C';
    if (score >= 0.2) return 'D';
    return 'F';
  }
}

export default new PerformanceService();