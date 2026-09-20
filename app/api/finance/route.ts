import { NextRequest, NextResponse } from "next/server";
import { FinanceRecordSchema, FinanceSummarySchema, validateRequest } from "@/lib/zod/schemas";
import financeService from "@/domain/finance.service";

export async function GET(request: NextRequest) {
  const params: Record<string, string> = {};
  request.nextUrl.searchParams.forEach((v, k) => { params[k] = v; });

  const parsed = validateRequest(FinanceSummarySchema, params);
  if (!parsed.success) {
    return NextResponse.json({ success: false, error: parsed.error }, { status: 400 });
  }

  const startDate = parsed.data.startDate || new Date(Date.now() - 30 * 86400000).toISOString().split("T")[0];
  const endDate = parsed.data.endDate || new Date().toISOString().split("T")[0];
  const summary = await financeService.summaryByRange(startDate, endDate);
  return NextResponse.json({ success: true, summary });
}

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ success: false, error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = validateRequest(FinanceRecordSchema, body);
  if (!parsed.success) {
    return NextResponse.json({ success: false, error: parsed.error }, { status: 400 });
  }

  const record = await financeService.record({
    ...parsed.data,
    occurred_at: parsed.data.occurred_at || new Date().toISOString(),
  });
  return NextResponse.json({ success: true, record }, { status: 201 });
}
