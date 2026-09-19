/**
 * Trend Service - Domain layer for trend-related operations.
 * 
 * Normalizes trend signals from various sources into structured records.
 * Provides read-only access to trend data for the AI agents.
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

export type TrendSummary = {
  keyword: string;
  overall_direction: 'up' | 'down' | 'stable';
  confidence: number;
  related_products: string[];
};

export class TrendService {
  // private supabase: ReturnType<typeof createClient>;

  constructor() {
    // this.supabase = supabase;
  }

  /**
   * Record a new trend signal from a source
   */
  async record(signal: Omit<TrendSignal, 'id' | 'recorded_at'>): Promise<TrendSignal> {
    const id = `trend_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const record: TrendSignal = {
      id,
      ...signal,
      recorded_at: new Date().toISOString(),
    };
    // In production, would save to Supabase
    return record;
  }

  /**
   * Get trends by keyword, optionally filtered
   */
  async getByKeyword(keyword: string, options: { limit?: number; minScore?: number } = {}): Promise<TrendSignal[]> {
    // const { data, error } = await this.supabase
    //   .from('trends')
    //   .select('*')
    //   .ilike('keyword', `%${keyword}%`)
    //   .gte('signal_score', options.minScore ?? 0)
    //   .order('recorded_at', { ascending: false })
    //   .limit(options.limit ?? 10);

    // if (error) throw error;
    // return data || [];

    // Demo mode: return empty array (no real trend data without configured sources)
    return [];
  }

  /**
   * Get trending keywords summary
   */
  async summarize(): Promise<TrendSummary[]> {
    // const { data, error } = await this.supabase
    //   .from('trends')
    //   .select('keyword');

    // if (error) throw error;

    // Mock summary for demo
    return [
      {
        keyword: "AI productivity tools",
        overall_direction: 'up',
        confidence: 0.78,
        related_products: ['prod_2'],
      },
      {
        keyword: "affiliate marketing AI",
        overall_direction: 'up',
        confidence: 0.65,
        related_products: ['prod_1'],
      },
    ];
  }

  /**
   * Check if a keyword is currently trending
   */
  async isTrending(keyword: string, threshold: number = 0.5): Promise<boolean> {
    const trends = await this.getByKeyword(keyword, { minScore: threshold });
    return trends.length > 0;
  }
}

export default new TrendService();