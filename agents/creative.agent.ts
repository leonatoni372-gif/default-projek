/**
 * Creative Agent - Generate structured creative briefs and mock asset generation.
 * 
 * Produces creative briefs with:
 * - hook, audience, problem, promise, product
 * - proof type, shot list, B-roll, voice-over, on-screen text
 * - CTA, affiliate disclosure, duration, aspect ratio, platform
 * 
 * Does not generate fake proof.
 * Provides mock asset generation adapters.
 */

export type CreativeBrief = {
  hook: string;
  audience: string;
  problem: string;
  promise: string;
  product: string;
  proof_type: 'case_study' | 'demo' | 'data' | 'none';
  shot_list: string[];
  b_roll: string[];
  voice_over: string;
  on_screen_text: string;
  cta: string;
  affiliate_disclosure: string;
  duration: string;
  aspect_ratio: '16:9' | '9:16' | '1:1';
  platform: string;
};

export type CreativeInput = {
  product_name: string;
  product_description: string;
  trend_keyword: string;
  platform: 'youtube' | 'tiktok' | 'instagram';
};

export type CreativeOutput = {
  brief: CreativeBrief;
  asset_requests: Array<{ type: string; prompt: string }>;
  compliance_note: string;
};

export class CreativeAgent {
  /**
   * Generate a structured creative brief
   */
  async generateBrief(input: CreativeInput): Promise<CreativeOutput> {
    const brief: CreativeBrief = {
      hook: `Discover the power of ${input.trend_keyword} with ${input.product_name}`,
      audience: `Aspiring affiliate marketers interested in ${input.trend_keyword}`,
      problem: `Most creators struggle to convert ${input.trend_keyword} into actionable content`,
      promise: `Learn the framework to create engaging ${input.platform} content`,
      product: input.product_name,
      proof_type: 'demo', // Never fake proof
      shot_list: [
        `Hook: ${input.trend_keyword} question to grab attention`,
        'Problem: Showcase common content mistakes',
        'Solution: Introduce the framework',
        'Product: Show ${input.product_name} features',
        'CTA: Direct call to action',
      ],
      b_roll: [
        'Screen recording of the product interface',
        'Stock footage of creators working',
        'Data visualization graphics',
      ],
      voice_over: `Are you looking for ways to leverage ${input.trend_keyword} in your affiliate marketing?`,
      on_screen_text: `${input.trend_keyword} Marketing Strategy`,
      cta: `Learn more about ${input.product_name}`,
      affiliate_disclosure: 'This content contains affiliate links. I may earn a commission at no extra cost to you.',
      duration: '60-90 seconds',
      aspect_ratio: input.platform === 'tiktok' ? '9:16' : '16:9',
      platform: input.platform,
    };

    // Generate asset requests (mock)
    const assetRequests = [
      { type: 'thumbnail', prompt: `Create a ${input.platform} thumbnail for ${input.product_name}` },
      { type: 'voiceover', prompt: `Professional voiceover for ${input.platform} about ${input.trend_keyword}` },
    ];

    return {
      brief,
      asset_requests: assetRequests,
      compliance_note: 'Creative brief generated with mock data. No fake proof was created.',
    };
  }

  /**
   * Request mock asset generation (mock adapter)
   */
  async generateAsset(assetType: string, prompt: string): Promise<{ url: string; status: string }> {
    // Mock asset generation adapter
    // In production, would integrate with actual asset generation APIs
    return {
      url: `/assets/mock_${assetType}_${Date.now()}.jpg`,
      status: 'ready',
    };
  }
}

export default new CreativeAgent();