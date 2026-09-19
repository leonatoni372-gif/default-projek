/**
 * Product Research Agent - Converts sources into normalized product opportunities.
 * 
 * Purpose: Convert sources into normalized product opportunities.
 * Never invent availability, pricing, commissions, or reviews.
 * Tool permissions: read product sources, normalize data
 * Forbidden: fabricate product details, invent pricing or commissions
 */

export type ProductOpportunity = {
  id: string;
  name: string;
  description: string;
  source: string;
  affiliate_url: string;
  price: number;
  commission_rate: number;
  availability: 'available' | 'limited' | 'unavailable';
  confidence: number; // 0-1 based on source reliability
  raw_data: Record<string, any>; // Original source data for audit
};

export type ProductResearchInput = {
  trendKeywords: string[];
  sourcePreferences?: string[];
  excludeCategories?: string[];
};

export type ProductResearchOutput = {
  opportunities: ProductOpportunity[];
  rejected_sources: { source: string; reason: string }[];
  analysis: string;
};

export class ProductResearchAgent {
  // private supabase: ReturnType<typeof createClient>;

  constructor() {
    // this.supabase = supabase;
  }

  /**
   * Research products based on trend keywords and source preferences
   */
  async research(input: ProductResearchInput): Promise<ProductResearchOutput> {
    const opportunities: ProductOpportunity[] = [];
    const rejectedSources: { source: string; reason: string }[] = [];

    // In production, would query configured product sources (Amazon, ClickBank, etc.)
    // For demo, generate mock opportunities based on trend keywords
    for (const keyword of input.trendKeywords) {
      const opp = this.generateMockOpportunity(keyword, rejectedSources);
      if (opp) {
        opportunities.push(opp);
      }
    }

    // Sort by confidence (highest first)
    opportunities.sort((a, b) => b.confidence - a.confidence);

    // Generate analysis
    const analysis = this.generateAnalysis(opportunities, rejectedSources);

    return {
      opportunities,
      rejected_sources: rejectedSources,
      analysis,
    };
  }

  private generateMockOpportunity(keyword: string, rejected: { source: string; reason: string }[]): ProductOpportunity | null {
    // Mock product data - never invent realistic claims
    const productNames = [
      'AI Productivity Course',
      'AI Content Creation Tool',
      'AI Analytics Dashboard',
      'AI Design Suite',
      'AI Marketing Automation',
    ];

    const descriptions = [
      'Learn to use AI tools for increased productivity',
      'Create content faster with AI assistance',
      'Track and analyze your marketing performance',
      'Design graphics and videos using AI',
      'Automate repetitive marketing tasks',
    ];

    const sourceNames = ['Amazon', 'ClickBank', 'ShareASale', 'Direct Program'];

    // 20% chance of "unavailable" to demonstrate the constraint
    const availabilityOptions = ['available', 'limited', 'unavailable'];
    const availabilityWeight = Math.random();
    let availability: 'available' | 'limited' | 'unavailable';
    if (availabilityWeight < 0.6) availability = 'available';
    else if (availabilityWeight < 0.85) availability = 'limited';
    else availability = 'unavailable';

    // Only create opportunity if not unavailable (demo constraint)
    if (availability === 'unavailable') {
      rejected.push({
        source: sourceNames[Math.floor(Math.random() * sourceNames.length)],
        reason: `Product related to "${keyword}" marked unavailable by source`,
      });
      return null;
    }

    const name = productNames[Math.floor(Math.random() * productNames.length)];
    const description = descriptions[Math.floor(Math.random() * descriptions.length)];
    const price = (Math.random() * 200 + 10).toFixed(2); // $10-$210
    const commissionRate = (Math.random() * 50).toFixed(1); // 0-50%
    const confidence = 0.3 + Math.random() * 0.5; // 0.3-0.8

    return {
      id: `prod_research_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name,
      description: `Related to keyword: ${keyword}. ${description}`,
      source: sourceNames[Math.floor(Math.random() * sourceNames.length)],
      affiliate_url: `https://example.com/affiliate/${Math.random().toString(36).substr(2, 8)}`,
      price: Number(price),
      commission_rate: Number(commissionRate),
      availability,
      confidence: Number(confidence.toFixed(2)),
      raw_data: {
        keyword,
        generated_at: new Date().toISOString(),
        mock: true,
      },
    };
  }

  private generateAnalysis(
    opportunities: ProductOpportunity[],
    rejectedSources: { source: string; reason: string }[]
  ): string {
    let analysis = '';

    if (opportunities.length === 0) {
      analysis = 'No available product opportunities found. This may indicate all sourced products are currently unavailable or keywords need broadening.';
      return analysis;
    }

    analysis = `Found ${opportunities.length} available product opportunities. `;

    // By category/price range
    const avgPrice = opportunities.reduce((sum, o) => sum + o.price, 0) / opportunities.length;
    analysis += `Average price: $${avgPrice.toFixed(2)}. `;

    // By commission rate
    const avgCommission = opportunities.reduce((sum, o) => sum + o.commission_rate, 0) / opportunities.length;
    analysis += `Average commission rate: ${avgCommission.toFixed(1)}%. `;

    // By confidence
    const highConfidence = opportunities.filter(o => o.confidence > 0.6).length;
    analysis += `${highConfidence} of ${opportunities.length} opportunities have high confidence (>= 0.6). `;

    // Rejected sources
    if (rejectedSources.length > 0) {
      analysis += `Rejected ${rejectedSources.length} sources (unavailable or low quality). `;
    }

    analysis += 'Recommendation: Use the Product Scoring Agent to evaluate these opportunities against your criteria.';

    return analysis;
  }

  /**
   * Generate system prompt for the Product Research Agent
   */
  getSystemPrompt(): string {
    return `You are the Product Research Agent for the AI Affiliate Operating System.

Your purpose is to convert product sources into normalized product opportunities that other agents can evaluate and score.

CORE RESPONSIBILITIES:
1. Read product data from configured affiliate sources (Amazon, ClickBank, ShareASale, direct programs)
2. Normalize disparate data formats into consistent opportunity records
3. Never invent availability, pricing, commissions, or reviews
4. Mark products as unavailable when sources indicate so
5. Preserve raw source data for audit trail and transparency
6. Provide confidence scores based on source reliability, not fabricated data

INPUT you receive:
- Keywords or topics to research products for
- Optional: source preferences (which affiliate networks to prioritize)
- Optional: categories to exclude

OUTPUT you provide:
- Product opportunities with: name, description, source, affiliate URL, price, commission rate, availability, confidence
- Rejected sources with reasons (for audit transparency)
- Analysis summary of what was found

FORBIDDEN:
- Fabricating product reviews, usage experiences, or sales numbers
- Inventing pricing or commission rates not present in source data
- Presenting unavailable products as available
- Hiding the source of product information
- Making claims about product profitability based on incomplete data

Remember: Your role is to expose evidence, not create it. The confidence score should reflect data quality and source reliability, not serve as a "success predictor."`;
  }
}

export default new ProductResearchAgent();