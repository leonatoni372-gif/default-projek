/**
 * Trend Agent - Normalizes trend signals into structured trend records.
 * 
 * Purpose: Read trend/product data, create research records.
 * Tool permissions: read trend data from configured sources
 * Forbidden: invent trend data, fabricate signals
 */

export type TrendSignal = {
  id: string;
  keyword: string;
  source: string;
  signal_score: number; // -1 to 1, positive = trending up
  trend_data: {
    historical_volume: number;
    recent_change_pct: number;
    peak_period: string;
  };
  recorded_at: string;
  limitations: string;
};

export type TrendResearch = {
  keyword: string;
  direction: 'up' | 'down' | 'stable';
  strength: number; // 0-1
  related_product_opportunities: string[]; // product IDs
  rationale: string;
};

export type TrendAgentInput = {
  keywords: string[];
  sources?: string[];
};

export type TrendAgentOutput = {
  trends: TrendResearch[];
  raw_signals: TrendSignal[];
  analysis: string;
};

export class TrendAgent {
  // private supabase: ReturnType<typeof createClient>;

  constructor() {
    // this.supabase = supabase;
  }

  /**
   * Analyze keywords for trend signals
   */
  async research(input: TrendAgentInput): Promise<TrendAgentOutput> {
    const rawSignals: TrendSignal[] = [];
    const trends: TrendResearch[] = [];

    // In production, would query configured trend sources
    // For demo, generate mock signals based on keywords
    for (const keyword of input.keywords) {
      const signal = this.generateMockSignal(keyword);
      rawSignals.push(signal);

      // Determine direction and strength
      const direction = signal.signal_score > 0 ? 'up' : signal.signal_score < 0 ? 'down' : 'stable';
      const strength = Math.abs(signal.signal_score);

      // Determine related product opportunities (mock)
      const relatedProducts = signal.signal_score > 0 ? ['prod_1', 'prod_2'] : [];

      const trend: TrendResearch = {
        keyword: signal.keyword,
        direction,
        strength: Number(strength.toFixed(2)),
        related_product_opportunities: relatedProducts,
        rationale: this.generateRationale(signal),
      };

      trends.push(trend);
    }

    // Sort by strength (strongest first)
    trends.sort((a, b) => b.strength - a.strength);

    return {
      trends,
      raw_signals: rawSignals,
      analysis: this.generateAnalysis(trends),
    };
  }

  private generateMockSignal(keyword: string): TrendSignal {
    // Simple mock: some keywords get positive scores, some negative
    const positiveKeywords = ['AI', 'productivity', 'affiliate', 'marketing', 'tools'];
    const negativeKeywords = ['scam', 'fake', 'overpriced', 'expensive', 'risk'];

    let score = 0;
    const lowerKeyword = keyword.toLowerCase();

    if (positiveKeywords.some(k => lowerKeyword.includes(k))) {
      score = 0.3 + Math.random() * 0.4; // 0.3 to 0.7
    } else if (negativeKeywords.some(k => lowerKeyword.includes(k))) {
      score = -0.3 - Math.random() * 0.4; // -0.3 to -0.7
    } else {
      score = Math.random() * 0.2 - 0.1; // -0.1 to 0.1
    }

    return {
      id: `trend_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      keyword,
      source: 'mock-demo-source',
      signal_score: Number(score.toFixed(2)),
      trend_data: {
        historical_volume: Math.floor(Math.random() * 10000),
        recent_change_pct: Number((Math.random() * 20 - 10).toFixed(1)), // -10% to +10%
        peak_period: 'Q4 2024',
      },
      recorded_at: new Date().toISOString(),
      limitations: 'Mock data - real sources would provide actual market data',
    };
  }

  private generateRationale(signal: TrendSignal): string {
    const score = signal.signal_score;
    if (score > 0.5) {
      return `Strong positive trend signal for "${signal.keyword}". Audience interest is growing rapidly.`;
    } else if (score > 0.2) {
      return `Moderate positive trend for "${signal.keyword}". Worth monitoring and potentially researching product opportunities.`;
    } else if (score > 0) {
      return `Mild positive trend for "${signal.keyword}". Low-confidence signal; consider additional research.`;
    } else if (score > -0.2) {
      return `Slight negative trend for "${signal.keyword}". Not concerning; may be normal market fluctuation.`;
    } else if (score > -0.5) {
      return `Moderate negative trend for "${signal.keyword}". Worth investigating if pattern persists.`;
    } else {
      return `Strong negative trend for "${signal.keyword}". Avoid promoting related products at this time.`;
    }
  }

  private generateAnalysis(trends: TrendResearch[]): string {
    if (trends.length === 0) return 'No significant trend signals found.';

    const upTrends = trends.filter(t => t.direction === 'up');
    const downTrends = trends.filter(t => t.direction === 'down');

    let analysis = '';
    if (upTrends.length > 0) {
      analysis += `Found ${upTrends.length} upward trending keywords. `;
      analysis += `Top trending: ${upTrends[0].keyword} (strength: ${upTrends[0].strength}). `;
    }
    if (downTrends.length > 0) {
      analysis += `Also noting ${downTrends.length} downward trending keywords. `;
      if (downTrends.length === 1) {
        analysis += `${downTrends[0].keyword} shows declining interest. `;
      } else {
        analysis += 'Multiple keywords showing declining interest. ';
      }
    }

    analysis += 'Recommendation: Focus content research on upward-trending keywords with product opportunities.';

    return analysis;
  }

  /**
   * Generate system prompt for the Trend agent
   */
  getSystemPrompt(): string {
    return `You are the Trend Agent for the AI Affiliate Operating System.

Your purpose is to normalize trend signals from various sources into structured trend records that the system can use for opportunity discovery.

CORE RESPONSIBILITIES:
1. Read trend/product data from configured sources (Google Trends, social media, market reports)
2. Normalize signals into consistent format with source, timestamp, confidence, and limitations
3. Never invent availability, pricing, commissions, or reviews
4. Provide clear rationale for each trend signal
5. Flag limitations and data quality issues

INPUT you receive:
- Keywords to research for trending topics
- Optional: specific sources to query (Google Trends, Twitter, Reddit, etc.)

OUTPUT you provide:
- Structured trend signals with keyword, source, signal score (-1 to 1), trend data, and limitations
- Research summaries with direction (up/down/stable) and strength (0-1)
- Related product opportunities (based on evidence, not invention)
- Analysis of what trends are most promising

FORBIDDEN:
- Inventing trend data or fabricating signals
- Presenting subjective opinions as objective trend data
- Downplaying important limitations to make data look more positive
- Making claims about product availability or profitability based solely on trend data

Remember: Trend data is decision-support, not prediction. Your role is to provide evidence, not to make the research decision yourself.`;
  }
}

export default new TrendAgent();