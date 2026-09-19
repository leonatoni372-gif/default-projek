/**
 * Product Scoring Agent - Transparent scoring engine for product evaluation.
 * 
 * Returns component scores and rationale for:
 * - demand
 * - commission
 * - price fit
 * - content potential
 * - competition
 * - confidence
 * - historical performance
 * 
 * Does not present the score as an objective truth.
 * Stores component scores and rationale.
 */

export type ComponentScores = {
  demand: number; // 0-1, based on trend signals
  commission: number; // 0-1, based on commission rate
  price_fit: number; // 0-1, based on price point vs audience
  content_potential: number; // 0-1, based on content suitability
  competition: number; // 0-1, based on market saturation
  confidence: number; // 0-1, based on historical data
  historical_performance: number; // 0-1, based on past results
  overall: number; // 0-1 composite score (unweighted average of components)
};

export type ScoreRationale = {
  demand: string;
  commission: string;
  price_fit: string;
  content_potential: string;
  competition: string;
  confidence: string;
  historical_performance: string;
  overall: string;
};

export type ProductScoringInput = {
  product: {
    id: string;
    name: string;
    price: number;
    commission_rate: number;
    historical_performance?: {
      views: number;
      clicks: number;
      orders: number;
      revenue: number;
    };
  };
  trendSignals?: {
    keyword: string;
    signal_score: number; // -1 to 1
  }[];
};

export type ProductScoringOutput = {
  scores: ComponentScores;
  rationale: ScoreRationale;
  disclaimer: string; // Note that this is decision-support, not objective truth
  recommendations: string[];
};

export class ProductScoringAgent {
  /**
   * Score a product using the transparent scoring engine.
   * Returns component scores and overall score with full rationale.
   */
  async score(input: ProductScoringInput): Promise<ProductScoringOutput> {
    const { product, trendSignals } = input;
    const { price, commission_rate, historical_performance } = product;

    const rationale: ScoreRationale = {
      demand: '',
      commission: '',
      price_fit: '',
      content_potential: '',
      competition: '',
      confidence: '',
      historical_performance: '',
      overall: '',
    };

    // 1. Demand score based on trend signals
    let demand = 0.3; // base score when no data
    let demandRationale = 'No trend data available; using baseline score of 0.3';

    if (trendSignals && trendSignals.length > 0) {
      const positiveSignals = trendSignals.filter(s => s.signal_score > 0);
      const avgSignal = positiveSignals.length > 0
        ? trendSignals.reduce((sum, s) => sum + s.signal_score, 0) / positiveSignals.length
        : 0;

      demand = Math.min(1, 0.3 + avgSignal * 1.2); // Map -1..1 to roughly 0.1..1.5, capped at 1
      if (avgSignal > 0.5) {
        demandRationale = `Strong positive trend signals (avg score: ${avgSignal.toFixed(2)}) indicate high demand`;
      } else if (avgSignal > 0) {
        demandRationale = `Positive trend signals (avg score: ${avgSignal.toFixed(2)}) suggest moderate demand`;
      } else if (avgSignal > -0.3) {
        demandRationale = `Neutral to slightly negative trends (avg score: ${avgSignal.toFixed(2)}) suggest modest demand`;
      } else {
        demandRationale = `Negative trend signals (avg score: ${avgSignal.toFixed(2)}) indicate low demand potential`;
      }
    } else {
      demandRationale = 'No trend signals provided; using baseline demand score';
    }
    rationale.demand = demandRationale;

    // 2. Commission score based on commission rate
    const commission = Math.min(1, commission_rate / 50); // Normalize: 50% = 1.0, 0% = 0.0
    const commissionRationale = `Commission rate: ${commission_rate}% (normalized score: ${commission.toFixed(2)})`;
    rationale.commission = commissionRationale;

    // 3. Price fit score based on price point
    let priceFit: number;
    const priceRationale: string = (() => {
      if (price > 0 && price < 20) {
        priceFit = 0.8;
        return 'Low price point (<$20) - high accessibility, lower per-order revenue';
      } else if (price >= 20 && price < 100) {
        priceFit = 0.9;
        return 'Moderate price point ($20-$100) - good balance of accessibility and revenue';
      } else if (price >= 100 && price < 500) {
        priceFit = 0.7;
        return 'Higher price point ($100-$500) - lower conversion but higher per-order revenue';
      } else if (price >= 500) {
        priceFit = 0.5;
        return 'Very high price (>$500) - niche audience, low conversion rate';
      } else {
        priceFit = 0.6;
        return 'Price not specified; using moderate assumption';
      }
    })();
    rationale.price_fit = priceRationale;

    // 4. Content potential based on product characteristics
    const contentPotential = product.historical_performance && product.historical_performance.orders > 0
      ? Math.min(1, (product.historical_performance.orders / 50) * 0.5 + 0.5)
      : 0.5; // baseline
    const contentPotentialRationale = `Content potential: ${product.historical_performance ? `${product.historical_performance.orders} historical orders` : 'no historical data'} - ${contentPotential >= 0.8 ? 'good content fit' : 'content may need adaptation'}`;
    rationale.content_potential = contentPotentialRationale;

    // 5. Competition - assume moderate unless we have data
    const competition = 0.6;
    const competitionRationale = `Competition: moderate market assumption (score: ${competition.toFixed(2)}). Further research recommended for accurate assessment.`;
    rationale.competition = competitionRationale;

    // 6. Confidence based on data availability
    const hasTrendData = trendSignals && trendSignals.length > 0;
    const hasHistoricalData = historical_performance && historical_performance.orders > 0;
    const confidence = (hasTrendData ? 0.3 : 0) + (hasHistoricalData ? 0.4 : 0) + 0.3; // 0.3-1.0
    const confidenceRationale = `Confidence: ${confidence.toFixed(2)} based on ${hasTrendData ? 'trend data' : 'no trend data'} and ${hasHistoricalData ? 'historical performance' : 'no historical data'}`;
    rationale.confidence = confidenceRationale;

    // 7. Historical performance composite
    const historical = historical_performance
      ? Math.min(1,
        (historical_performance.views / 10000 + historical_performance.orders / 50 + historical_performance.clicks / 1000) / 3
      )
      : 0.2;
    const historicalRationale = `Historical performance: ${historical_performance
      ? `views: ${historical_performance.views}, clicks: ${historical_performance.clicks}, orders: ${historical_performance.orders}`
      : 'no historical data available'} - score: ${historical.toFixed(2)}`;
    rationale.historical_performance = historicalRationale;

    // 8. Overall score = unweighted average of component scores
    const overall = Number(
      ((demand + commission + priceFit + contentPotential + competition + confidence + historical) / 7)
      .toFixed(4)
    );

    return {
      scores: {
        demand: Number(demand.toFixed(2)),
        commission: Number(commission.toFixed(2)),
        price_fit: Number(priceFit.toFixed(2)),
        content_potential: Number(contentPotential.toFixed(2)),
        competition: Number(competition.toFixed(2)),
        confidence: Number(confidence.toFixed(2)),
        historical_performance: Number(historical.toFixed(2)),
        overall: Number(overall.toFixed(2)),
      },
      rationale,
      disclaimer:
        'This score is decision-support only, not objective truth. Component scores and rationale are stored for transparency. No single score should be used as the sole basis for business decisions.',
      recommendations: this.generateRecommendations({
        demand, commission, priceFit, contentPotential, competition, confidence, historical,
      }),
    };
  }

  private generateRecommendations(component: {
    demand: number; commission: number; priceFit: number;
    contentPotential: number; competition: number; confidence: number; historical: number;
  }): string[] {
    const recs: string[] = [];

    if (component.demand > 0.6) recs.push('High demand detected - good market opportunity');
    if (component.demand < 0.3) recs.push('Low demand - consider alternative products');

    if (component.commission > 0.4) recs.push('Strong commission rate - attractive revenue potential');
    if (component.commission < 0.1) recs.push('Low commission - may not justify promotional effort');

    if (component.priceFit > 0.8) recs.push('Good price fit - accessible to target audience');
    if (component.priceFit < 0.4) recs.push('Price may be too high or too low for target audience');

    if (component.contentPotential > 0.7) recs.push('Excellent content potential - easy to create engaging content');
    if (component.contentPotential < 0.3) recs.push('Low content potential - may require significant adaptation');

    if (component.confidence > 0.7) recs.push('High confidence - decisions based on solid data');
    if (component.confidence < 0.3) recs.push('Low confidence - gather more data before committing');

    if (component.historical > 0.6) recs.push('Strong historical performance - proven track record');
    if (component.historical < 0.2) recs.push('Limited historical data - treat as new opportunity');

    return recs;
  }

  /**
   * Log the scoring decision for audit trail
   */
  async logDecision(decision: {
    productId: string;
    scores: ComponentScores;
    rationale: ScoreRationale;
    userId: string;
  }): Promise<void> {
    // In production, would save to ai_decisions table in Supabase
    // const { error } = await this.supabase
    //   .from('ai_decisions')
    //   .insert({
    //     decision_type: 'product_score',
    //     input_data: { productId: decision.productId },
    //     output_data: {
    //       scores: decision.scores,
    //       rationale: decision.rationale,
    //     },
    //     rationale: JSON.stringify(decision.rationale),
    //     status: 'logged',
    //     created_by: decision.userId,
    //     created_at: new Date().toISOString(),
    //   });

    // if (error) throw error;
    console.log('Product scoring decision logged:', decision);
  }
}

export default new ProductScoringAgent();