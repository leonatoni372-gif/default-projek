/**
 * Experiment Agent - Design measurable variants and interpret results conservatively.
 * 
 * Supports: hook A/B, CTA A/B, format A/B, duration A/B, creative A/B
 * Track: hypothesis, variants, metrics, result, confidence/limitations
 * Do not call a result causal unless the experimental design justifies it.
 */

export type ExperimentType = 'hook' | 'CTA' | 'format' | 'duration' | 'creative';
export type ExperimentStatus = 'proposed' | 'running' | 'completed' | 'cancelled';

export type Variant = {
  id: string;
  name: string;
  variant_key: string;
  config: Record<string, any>;
  views: number;
  clicks: number;
  orders: number;
  commission: number;
};

export type Experiment = {
  id: string;
  name: string;
  description: string;
  hypothesis: string;
  type: ExperimentType;
  status: ExperimentStatus;
  variants: Variant[];
  metrics: Record<string, any>;
  result?: {
    winner?: string;
    confidence: number;
    limitations: string[];
    is_causal: boolean; // Only true if design justifies causality
  };
  created_at: string;
};

export type ExperimentInput = {
  hypothesis: string;
  type: ExperimentType;
  variantConfigs: Array<{ name: string; config: Record<string, any> }>;
};

export class ExperimentAgent {
  /**
   * Create a new experiment
   */
  async create(input: ExperimentInput): Promise<Experiment> {
    const variants: Variant[] = input.variantConfigs.map((v, i) => ({
      id: `variant_${Date.now()}_${i}`,
      name: v.name,
      variant_key: v.name.toLowerCase().replace(/\s+/g, '_'),
      config: v.config,
      views: 0,
      clicks: 0,
      orders: 0,
      commission: 0,
    }));

    const experiment: Experiment = {
      id: `exp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: input.hypothesis,
      description: `Experiment: ${input.type} variant test`,
      hypothesis: input.hypothesis,
      type: input.type,
      status: 'proposed',
      variants,
      metrics: {},
      created_at: new Date().toISOString(),
    };

    return experiment;
  }

  /**
   * Interpret experiment results conservatively
   * Do not claim causality unless the design justifies it
   */
  async interpret(experiment: Experiment): Promise<Experiment['result']> {
    const { variants } = experiment;
    const limitations: string[] = [];
    let isCausal = false;
    let winner: string | undefined;
    let confidence = 0;

    if (variants.length < 2) {
      return { winner: undefined, confidence: 0, limitations: ['Insufficient variants for comparison'], is_causal: false };
    }

    // Calculate performance for each variant
    const performances = variants.map(v => {
      const clicks = v.clicks;
      const orders = v.orders;
      const commission = v.commission;
      const ctr = v.views > 0 ? clicks / v.views : 0;
      const cvr = clicks > 0 ? orders / clicks : 0;
      return { ...v, ctr, cvr };
    });

    // Sort by commission (primary metric)
    performances.sort((a, b) => b.commission - a.commission);
    winner = performances[0].name;

    // Calculate confidence
    // Simple heuristic: higher sample sizes = higher confidence
    const totalViews = variants.reduce((sum, v) => sum + v.views, 0);
    const totalOrders = variants.reduce((sum, v) => sum + v.orders, 0);
    confidence = totalViews > 1000 ? Math.min(0.9, totalOrders / totalViews * 10) : 0.3;

    // Check for causal design
    // Only claim causality if: random assignment, large enough sample, sufficient duration
    const sampleSizeAdequate = totalViews >= 1000;
    const sufficientDuration = variants.every(v => v.views > 100); // Each variant has enough data
    const randomAssignment = true; // Assumed in this demo

    if (sampleSizeAdequate && sufficientDuration && randomAssignment) {
      isCausal = true;
    } else {
      if (!sampleSizeAdequate) limitations.push('Sample size too small to establish causality');
      if (!sufficientDuration) limitations.push('Insufficient duration for causal claims');
    }

    // Add confidence limitations
    if (confidence < 0.5) {
      limitations.push('Low confidence - results may change with more data');
    }

    return {
      winner,
      confidence: Number(confidence.toFixed(2)),
      limitations,
      is_causal: isCausal,
    };
  }
}

export default new ExperimentAgent();