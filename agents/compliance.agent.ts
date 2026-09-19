/**
 * Compliance Agent - Return PASS, NEEDS_REVISION, or BLOCKED.
 * 
 * BLOCKED content cannot enter publishing state.
 * Returns issues and evidence for each check.
 */

export type ComplianceIssue = {
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

export type ComplianceInput = {
  content_text: string;
  has_affiliate_disclosure: boolean;
  claims: string[];
  testimonials: string[];
  scarcity_claims: string[];
  before_after_content: boolean;
  product_attribution: boolean;
  platform: string;
};

export class ComplianceAgent {
  /**
   * Run compliance checks on content
   * Returns PASS, NEEDS_REVISION, or BLOCKED
   */
  async check(input: ComplianceInput): Promise<ComplianceResult> {
    const issues: ComplianceIssue[] = [];
    const evidence: Record<string, any> = {};

    // 1. Affiliate disclosure check
    if (!input.has_affiliate_disclosure) {
      issues.push({
        category: 'affiliate_disclosure',
        severity: 'critical',
        message: 'Missing affiliate disclosure',
        evidence: { disclosure_present: false }
      });
    } else {
      evidence['affiliate_disclosure'] = { present: true };
    }

    // 2. Unsupported factual claims
    for (const claim of input.claims) {
      if (/guaranteed|100%|get rich|easy money/i.test(claim)) {
        issues.push({
          category: 'unsupported_claim',
          severity: 'critical',
          message: `Unsupported claim: "${claim.substring(0, 50)}..."`,
          evidence: { flagged_claim: claim }
        });
      }
    }

    // 3. Fabricated testimonials
    for (const testimonial of input.testimonials) {
      if (/fake|paid|actor/i.test(testimonial)) {
        issues.push({
          category: 'fabricated_testimonial',
          severity: 'critical',
          message: 'Potential fabricated testimonial',
          evidence: { flagged_testimonial: testimonial.substring(0, 50) }
        });
      }
    }

    // 4. Fake scarcity
    for (const claim of input.scarcity_claims) {
      if (/limited|last|while supplies/i.test(claim)) {
        issues.push({
          category: 'fake_scarcity',
          severity: 'warning',
          message: `Potential fake scarcity: "${claim.substring(0, 50)}..."`,
          evidence: { flagged_scarcity: claim }
        });
      }
    }

    // 5. Deceptive before/after
    if (input.before_after_content) {
      issues.push({
        category: 'deceptive_before_after',
        severity: 'critical',
        message: 'Deceptive before/after content detected',
        evidence: { has_before_after: true }
      });
    }

    // 6. Missing product attribution
    if (!input.product_attribution) {
      issues.push({
        category: 'missing_product_attribution',
        severity: 'warning',
        message: 'Missing product attribution',
        evidence: { has_attribution: false }
      });
    }

    // Determine status
    const hasCritical = issues.some(i => i.severity === 'critical');
    let status: 'PASS' | 'NEEDS_REVISION' | 'BLOCKED';
    if (hasCritical) status = 'BLOCKED';
    else if (issues.length > 0) status = 'NEEDS_REVISION';
    else status = 'PASS';

    return { status, issues, evidence };
  }

  /**
   * Generate system prompt
   */
  getSystemPrompt(): string {
    return `You are the Compliance Agent for the AI Affiliate Operating System.

Your purpose is to enforce pre-publish compliance checks.

CHECKS:
- Affiliate disclosure present
- No unsupported factual claim
- No fabricated testimonial
- No fake scarcity
- No deceptive before/after
- No prohibited tactic
- No missing product attribution
- Copyright/asset source field
- Platform-specific checklist

OUTPUT:
- PASS: Content approved for human review
- NEEDS_REVISION: Content needs changes before review
- BLOCKED: Content cannot enter publishing state

RULES:
- BLOCKED content cannot enter publishing state under any circumstance
- Always provide specific evidence for each issue
- Never override a BLOCKED status
- Never allow content to bypass compliance checks

Remember: Compliance is a gate, not a suggestion. Your role is to protect the system and users from legal and ethical violations.`;
  }
}

export default new ComplianceAgent();