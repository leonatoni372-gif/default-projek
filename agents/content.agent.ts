/**
 * Content Agent - Generate structured ideas/scripts using evidence.
 * 
 * Avoids unsupported claims.
 * Uses evidence supplied to the agent.
 * All AI outputs affecting business actions are logged.
 */

export type ContentIdea = {
  id: string;
  title: string;
  description: string;
  product_id: string;
  content_type: 'script' | 'article' | 'video' | 'post';
  evidence_basis: string[]; // References to data/trends used
};

export type ScriptOutput = {
  title: string;
  hook: string;
  problem: string;
  promise: string;
  product: string;
  proof: string;
  cta: string;
  affiliate_disclosure: string;
  duration: string;
  aspect_ratio: string;
  platform: string;
};

export type ContentAgentInput = {
  trendData: Array<{ keyword: string; direction: string; strength: number }>;
  productOpportunities: Array<{
    id: string;
    name: string;
    description: string;
    price: number;
    commission_rate: number;
  }>;
  complianceStatus: 'PASS' | 'NEEDS_REVISION' | 'BLOCKED';
};

export type ContentAgentOutput = {
  ideas: ContentIdea[];
  scripts: ScriptOutput[];
  warnings: string[];
  logged_decisions: string[];
};

export class ContentAgent {
  /**
   * Generate content ideas based on trend data and product opportunities
   */
  async generateIdeas(input: ContentAgentInput): Promise<ContentAgentOutput> {
    const ideas: ContentIdea[] = [];
    const scripts: ScriptOutput[] = [];
    const warnings: string[] = [];
    const loggedDecisions: string[] = [];

    // Check compliance first
    if (input.complianceStatus === 'BLOCKED') {
      warnings.push('Content generation blocked by compliance - cannot proceed');
      return { ideas, scripts, warnings, logged_decisions: loggedDecisions };
    }

    // Generate ideas based on trend data
    for (const trend of input.trendData.slice(0, 3)) {
      // Find matching product
      const matchingProduct = input.productOpportunities.find(
        p => p.name.toLowerCase().includes(trend.keyword.toLowerCase().slice(0, 5))
      );

      const ideaId = `idea_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const idea: ContentIdea = {
        id: ideaId,
        title: `How ${trend.keyword} Can Transform Your Business`,
        description: `Content idea based on ${trend.direction} trend with strength ${trend.strength}`,
        product_id: matchingProduct?.id || 'unknown',
        content_type: 'video',
        evidence_basis: [`Trend signal: ${trend.keyword} (${trend.direction})`, `Strength: ${trend.strength}`],
      };
      ideas.push(idea);
      loggedDecisions.push(`Created idea: ${idea.title} (ID: ${ideaId})`);

      // If compliance passed, also generate a script
      if (input.complianceStatus === 'PASS' && matchingProduct) {
        const script = await this.generateScript(trend, matchingProduct);
        scripts.push(script);
        loggedDecisions.push(`Generated script for: ${trend.keyword}`);
      }
    }

    // Log all AI outputs affecting business actions
    this.logDecisions(loggedDecisions);

    return { ideas, scripts, warnings, logged_decisions: loggedDecisions };
  }

  private async generateScript(trend: any, product: any): Promise<ScriptOutput> {
    return {
      title: `${trend.keyword} Review - ${product.name}`,
      hook: `Discover how ${trend.keyword} can help with ${product.name}`,
      problem: `Many people struggle with ${trend.keyword} in their affiliate marketing`,
      promise: `This review will show you the potential of ${product.name}`,
      product: product.name,
      proof: 'Based on available evidence and trends',
      cta: `Check out ${product.name}`,
      affiliate_disclosure: 'This content contains affiliate links',
      duration: '60s',
      aspect_ratio: '9:16',
      platform: 'tiktok'
    };
  }

  private logDecisions(decisions: string[]): void {
    for (const decision of decisions) {
      // In production, would save to ai_decisions table
      console.log('[CONTENT AGENT]', decision);
    }
  }
}

export default new ContentAgent();