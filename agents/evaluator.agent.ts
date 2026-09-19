/**
 * Evaluator Agent - Analyze performance data and produce insights.
 * 
 * Ingests content performance metrics:
 * views, watch_time, retention, likes, comments, shares, saves,
 * profile_visits, clicks, orders, commission
 * 
 * Calculate CTR, CVR, earnings per 1k views, profit per content, engagement rate
 * Do not invent missing metrics.
 * 
 * Generate: what worked, what underperformed, hypotheses, recommended experiments.
 * Feed results back into CEO/Content agents.
 */

export type PerformanceData = {
  content_item_id: string;
  views: number;
  watch_time: number;
  retention: number; // percentage 0-1
  likes: number;
  comments: number;
  shares: number;
  saves: number;
  profile_visits: number;
  clicks: number;
  orders: number;
  commission: number;
};

export type AnalysisResult = {
  content_item_id: string;
  what_worked: string[];
  what_underperformed: string[];
  hypotheses: string[];
  recommended_experiments: string[];
  metrics: {
    ctr: number;
    cvr: number;
    earnings_per_1k: number;
    profit_per_content: number;
    engagement_rate: number;
  };
  overall_grade: 'A' | 'B' | 'C' | 'D' | 'F';
};

export type EvaluatorInput = PerformanceData;

export class EvaluatorAgent {
  /**
   * Analyze performance data and generate insights
   */
  async analyze(data: EvaluatorInput): Promise<AnalysisResult> {
    // Calculate metrics (never invent missing data)
    const views = data.views;
    const clicks = data.clicks;
    const orders = data.orders;
    const commission = data.commission;

    const ctr = views > 0 ? Number(((clicks / views) * 100).toFixed(2)) : 0;
    const cvr = clicks > 0 ? Number(((orders / clicks) * 100).toFixed(2)) : 0;
    const earningsPer1k = views > 0 ? Number(((commission / views) * 1000).toFixed(2)) : 0;
    const profitPerContent = commission;
    const engagementRate = views > 0
      ? Number((((data.likes + data.comments + data.shares + data.saves) / views) * 100).toFixed(2))
      : 0;

    // Generate insights
    const { what_worked, what_underperformed, hypotheses, recommended_experiments } =
      this.generateInsights(data, ctr, cvr, engagementRate);

    const grade = this.calculateGrade(ctr, cvr, engagementRate);

    return {
      content_item_id: data.content_item_id,
      what_worked,
      what_underperformed,
      hypotheses,
      recommended_experiments,
      metrics: { ctr, cvr, earnings_per_1k: earningsPer1k, profit_per_content: profitPerContent, engagement_rate: engagementRate },
      overall_grade: grade,
    };
  }

  private generateInsights(data: PerformanceData, ctr: number, cvr: number, engagementRate: number) {
    const whatWorked: string[] = [];
    const whatUnderperformed: string[] = [];
    const hypotheses: string[] = [];
    const recommendedExperiments: string[] = [];

    // CTR analysis
    if (ctr > 5) whatWorked.push(`Strong CTR of ${ctr}% - effective hook/thumbnail`);
    else if (ctr < 1) {
      whatUnderperformed.push(`Low CTR of ${ctr}% - need better thumbnail/hook`);
      hypotheses.push('Improved thumbnail or hook could increase clicks');
      recommendedExperiments.push('A/B test different thumbnail images');
    }

    // CVR analysis
    if (cvr > 3) whatWorked.push(`Strong CVR of ${cvr}% - audience converting well`);
    else if (cvr < 0.5) {
      whatUnderperformed.push(`Low CVR of ${cvr}% - conversion needs work`);
      hypotheses.push('Landing page or offer may not match audience expectations');
      recommendedExperiments.push('A/B test different CTAs or landing pages');
    }

    // Retention analysis
    if (data.retention > 60) whatWorked.push(`High retention at ${data.retention}% - engaging content`);
    else if (data.retention < 30) {
      whatUnderperformed.push(`Low retention at ${data.retention}% - losing viewers`);
      hypotheses.push('Shorter videos or stronger openings could improve retention');
      recommendedExperiments.push('Test shorter duration or different opening hooks');
    }

    // Engagement
    if (engagementRate > 10) whatWorked.push(`High engagement rate of ${engagementRate}%`);
    else if (engagementRate < 2) {
      whatUnderperformed.push(`Low engagement rate of ${engagementRate}%`);
      hypotheses.push('Content may not be resonating with target audience');
      recommendedExperiments.push('Test different content formats or platforms');
    }

    // Earnings
    if (data.commission > 100) whatWorked.push(`Good earnings - ${data.commission} commission generated`);

    return { what_worked: whatWorked, what_underperformed: whatUnderperformed, hypotheses, recommended_experiments: recommendedExperiments };
  }

  private calculateGrade(ctr: number, cvr: number, engagementRate: number): 'A' | 'B' | 'C' | 'D' | 'F' {
    if (ctr > 5 && cvr > 3 && engagementRate > 10) return 'A';
    if (ctr > 2 && cvr > 1 && engagementRate > 5) return 'B';
    if (ctr > 1 || cvr > 0.5 || engagementRate > 2) return 'C';
    if (ctr > 0 || cvr > 0 || engagementRate > 0) return 'D';
    return 'F';
  }
}

export default new EvaluatorAgent();