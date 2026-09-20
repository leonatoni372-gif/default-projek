import { NextRequest, NextResponse } from "next/server";
import { ComplianceCheckSchema, validateRequest } from "@/lib/zod/schemas";
import complianceService from "@/domain/compliance.service";

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ success: false, error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = validateRequest(ComplianceCheckSchema, body);
  if (!parsed.success) {
    return NextResponse.json({ success: false, error: parsed.error }, { status: 400 });
  }

  const { content_item_id, content_text, has_affiliate_disclosure, claims, testimonials, scarcity_claims, before_after_content, product_attribution, platform } = parsed.data;

  const result = await complianceService.check(content_item_id || "unknown", {
    script: content_text,
    hasAffiliateDisclosure: has_affiliate_disclosure,
    claims,
    testimonials,
    scarcityClaims: scarcity_claims,
    creative_brief: product_attribution ? { product: "known" } : undefined,
    platform,
  });

  return NextResponse.json({ success: true, result });
}
