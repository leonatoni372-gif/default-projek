import { NextRequest, NextResponse } from "next/server";
import { PerformanceRecordSchema, validateRequest } from "@/lib/zod/schemas";
import performanceService from "@/domain/performance.service";

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ success: false, error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = validateRequest(PerformanceRecordSchema, body);
  if (!parsed.success) {
    return NextResponse.json({ success: false, error: parsed.error }, { status: 400 });
  }

  const metrics = await performanceService.record(parsed.data);
  const analysis = await performanceService.analyze(metrics);
  return NextResponse.json({ success: true, metrics, analysis }, { status: 201 });
}
