import { NextRequest, NextResponse } from "next/server";
import { ContentCreateSchema, UpdateContentStatusSchema, validateRequest } from "@/lib/zod/schemas";
import contentService from "@/domain/content.service";

export async function GET(request: NextRequest) {
  const status = request.nextUrl.searchParams.get("status");
  if (status) {
    const parsed = validateRequest(UpdateContentStatusSchema.shape.status, status);
    if (!parsed.success) {
      return NextResponse.json({ success: false, error: `Invalid status: ${status}` }, { status: 400 });
    }
  }

  // Demo: return empty list (would query Supabase in production)
  return NextResponse.json({ success: true, items: [], count: 0 });
}

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ success: false, error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = validateRequest(ContentCreateSchema, body);
  if (!parsed.success) {
    return NextResponse.json({ success: false, error: parsed.error }, { status: 400 });
  }

  const item = await contentService.createItem(parsed.data);
  return NextResponse.json({ success: true, item }, { status: 201 });
}
