/**
 * Compliance Service - Domain layer for pre-publish compliance checks.
 * 
 * Runs checks against content to ensure it meets affiliate disclosure,
 * platform rules, and anti-fraud requirements.
 * Returns: PASS, NEEDS_REVISION, or BLOCKED.
 * BLOCKED content cannot enter publishing state.
 */

export type ComplianceIssue = {
  id: string;
  category: 'affiliate_disclosure' | 'unsupported_claim' | 'fabricated_testimonial' | 
           'fake_scarcity' | 'deceptive_before_after' | 'prohibited_tactic' |
           'missing_product_attribution' | 'copyright_violation';
  severity: 'critical' | 'warning' | 'info';
  message: string;
  evidence?: any;
};

export type ComplianceResult = {
  status: 'PASS' | 'NEEDS_REVISION' | 'BLOCKED';
  issues: ComplianceIssue[];
  evidence: Record<string, any>;
};

export class ComplianceService {
  // private supabase: ReturnType<typeof createClient>;

  constructor() {
    // this.supabase = supabase;
  }

  /**
   * Run compliance checks on content item
   */
  async check(contentItemId: string, contentData: {
    script?: string;
    creative_brief?: any;
    hasAffiliateDisclosure?: boolean;
    claims?: string[];
    testimonials?: string[];
    scarcityClaims?: string[];
    platform: 'youtube' | 'tiktok' | 'instagram' | 'twitter' | 'facebook';
  }): Promise<ComplianceResult> {
    const issues: ComplianceIssue[] = [];
    const evidence: Record<string, any> = {};

    // Check 1: Affiliate disclosure present
    if (contentData.hasAffiliateDisclosure === false) {
      issues.push({
        id: `issue_${Date.now()}_1`,
        category: 'affiliate_disclosure',
        severity: 'critical',
        message: 'Affiliate disclosure is missing',
        evidence: { hasDisclosure: false }
      });
    } else {
      evidence['affiliate_disclosure'] = { hasDisclosure: true };
    }

    // Check 2: Unsupported factual claims
    if (contentData.claims && contentData.claims.length > 0) {
      for (const claim of contentData.claims) {
        // Simple heuristic: claims about guaranteed results are flagged
        if (/guaranteed|100%| guaranteed|get rich quick|easy money/i.test(claim)) {
          issues.push({
            id: `issue_${Date.now()}_2`,
            category: 'unsupported_claim',
            severity: 'critical',
            message: `Unsupported claim detected: "${claim.substring(0, 50)}..."`,
            evidence: { flagged_claim: claim }
          });
        }
      }
    }

    // Check 3: Fabricated testimonials
    if (contentData.testimonials && contentData.testimonials.length > 0) {
      for (const testimonial of contentData.testimonials) {
        if (/fake|fabricated|paid actor|actors/i.test(testimonial)) {
          issues.push({
            id: `issue_${Date.now()}_3`,
            category: 'fabricated_testimonial',
            severity: 'critical',
            message: 'Fabricated or paid testimonial detected',
            evidence: { flagged_testimonial: testimonial.substring(0, 50) }
          });
        }
      }
    }

    // Check 4: Fake scarcity
    if (contentData.scarcityClaims && contentData.scarcityClaims.length > 0) {
      for (const claim of contentData.scarcityClaims) {
        if (/limited|only|last|hurry|while supplies last/i.test(claim)) {
          // Check if it's misleading scarcity
          issues.push({
            id: `issue_${Date.now()}_4`,
            category: 'fake_scarcity',
            severity: 'warning',
            message: `Potential fake scarcity: "${claim.substring(0, 50)}..."`,
            evidence: { flagged_claim: claim }
          });
        }
      }
    }

    // Check 5: Deceptive before/after
    if (contentData.claims && contentData.claims.some(c => /before.*after|transform|before.*after/i.test(c))) {
      issues.push({
        id: `issue_${Date.now()}_5`,
        category: 'deceptive_before_after',
        severity: 'critical',
        message: 'Deceptive before/after comparison detected',
        evidence: { has_before_after_comparison: true }
      });
    }

    // Check 6: Missing product attribution
    if (!contentData.creative_brief || !contentData.creative_brief.product) {
      issues.push({
        id: `issue_${Date.now()}_6`,
        category: 'missing_product_attribution',
        severity: 'warning',
        message: 'Missing product attribution in creative brief',
        evidence: { hasProductAttribution: false }
      });
    } else {
      evidence['product_attribution'] = { hasProductAttribution: true };
    }

    // Check 7: Copyright/asset source
    if (contentData.creative_brief && contentData.creative_brief.proof_type === 'none') {
      issues.push({
        id: `issue_${Date.now()}_7`,
        category: 'copyright_violation',
        severity: 'warning',
        message: 'No proof type specified - verify asset sources are licensed',
        evidence: { proof_type: 'none' }
      });
    }

    // Determine status
    const hasCritical = issues.some(i => i.severity === 'critical');
    
    let status: 'PASS' | 'NEEDS_REVISION' | 'BLOCKED';
    if (hasCritical) {
      status = 'BLOCKED';
    } else if (issues.length > 0) {
      status = 'NEEDS_REVISION';
    } else {
      status = 'PASS';
    }

    return {
      status,
      issues,
      evidence,
    };
  }

  /**
   * Get compliance result summary text
   */
  getStatusText(status: 'PASS' | 'NEEDS_REVISION' | 'BLOCKED'): string {
    switch (status) {
      case 'PASS': return 'Content passes compliance checks - ready for approval';
      case 'NEEDS_REVISION': return 'Content needs revision - some issues to address';
      case 'BLOCKED': return 'Content blocked - critical compliance issues prevent publishing';
      default: return 'Unknown status';
    }
  }
}

export default new ComplianceService();