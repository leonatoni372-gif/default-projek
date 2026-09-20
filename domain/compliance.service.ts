/**
 * Compliance Service - Domain layer for pre-publish compliance checks.
 * Uses real Supabase when configured, falls back to mock logic.
 */

import { getDb } from "@/lib/supabase/db";

export type ComplianceIssue = {
  id: string;
  category: "affiliate_disclosure" | "unsupported_claim" | "fabricated_testimonial" | "fake_scarcity" | "deceptive_before_after" | "prohibited_tactic" | "missing_product_attribution" | "copyright_violation";
  severity: "critical" | "warning" | "info";
  message: string;
  evidence?: Record<string, unknown>;
};

export type ComplianceResult = {
  status: "PASS" | "NEEDS_REVISION" | "BLOCKED";
  issues: ComplianceIssue[];
  evidence: Record<string, unknown>;
};

export class ComplianceService {
  async check(contentItemId: string, contentData: {
    script?: string;
    creative_brief?: Record<string, unknown>;
    hasAffiliateDisclosure?: boolean;
    claims?: string[];
    testimonials?: string[];
    scarcityClaims?: string[];
    platform: "youtube" | "tiktok" | "instagram" | "twitter" | "facebook";
  }): Promise<ComplianceResult> {
    const issues: ComplianceIssue[] = [];
    const evidence: Record<string, unknown> = {};
    const ts = Date.now();

    if (contentData.hasAffiliateDisclosure === false) {
      issues.push({ id: `issue_${ts}_1`, category: "affiliate_disclosure", severity: "critical", message: "Affiliate disclosure is missing" });
    } else {
      evidence["affiliate_disclosure"] = { hasDisclosure: true };
    }

    if (contentData.claims) {
      for (const claim of contentData.claims) {
        if (/guaranteed|100%|get rich quick|easy money/i.test(claim)) {
          issues.push({ id: `issue_${ts}_2`, category: "unsupported_claim", severity: "critical", message: `Unsupported claim: "${claim.slice(0, 50)}..."` });
        }
      }
    }

    if (contentData.testimonials) {
      for (const t of contentData.testimonials) {
        if (/fake|fabricated|paid actor/i.test(t)) {
          issues.push({ id: `issue_${ts}_3`, category: "fabricated_testimonial", severity: "critical", message: "Fabricated testimonial detected" });
        }
      }
    }

    if (contentData.scarcityClaims) {
      for (const claim of contentData.scarcityClaims) {
        if (/limited|only|last|hurry/i.test(claim)) {
          issues.push({ id: `issue_${ts}_4`, category: "fake_scarcity", severity: "warning", message: `Potential fake scarcity: "${claim.slice(0, 50)}..."` });
        }
      }
    }

    if (contentData.claims?.some((c) => /before.*after|transform/i.test(c))) {
      issues.push({ id: `issue_${ts}_5`, category: "deceptive_before_after", severity: "critical", message: "Deceptive before/after comparison" });
    }

    if (!contentData.creative_brief?.product) {
      issues.push({ id: `issue_${ts}_6`, category: "missing_product_attribution", severity: "warning", message: "Missing product attribution" });
    }

    if (contentData.creative_brief?.proof_type === "none") {
      issues.push({ id: `issue_${ts}_7`, category: "copyright_violation", severity: "warning", message: "No proof type - verify asset sources" });
    }

    const hasCritical = issues.some((i) => i.severity === "critical");
    const status = hasCritical ? "BLOCKED" : issues.length > 0 ? "NEEDS_REVISION" : "PASS";

    // Persist to Supabase when configured
    const db = getDb();
    if (db) {
      await db.from("compliance_checks").insert({
        content_item_id: contentItemId, status, issues, evidence,
      });
    }

    return { status, issues, evidence };
  }

  getStatusText(status: "PASS" | "NEEDS_REVISION" | "BLOCKED"): string {
    if (status === "PASS") return "Content passes compliance checks - ready for approval";
    if (status === "NEEDS_REVISION") return "Content needs revision - some issues to address";
    return "Content blocked - critical compliance issues prevent publishing";
  }
}

export default new ComplianceService();
