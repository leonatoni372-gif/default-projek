import { NextRequest, NextResponse } from "next/server";
import { N8nRequestSchema, validateRequest } from "@/lib/zod/schemas";

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ success: false, error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = validateRequest(N8nRequestSchema, body);
  if (!parsed.success) {
    return NextResponse.json({ success: false, error: parsed.error }, { status: 400 });
  }

  const { workflow, data, idempotencyKey } = parsed.data;
  const key = idempotencyKey || Math.random().toString(36).slice(2);

  try {
    const result = await processWorkflow(workflow, data);

    // In production, log this run to automation_runs table with idempotency_key

    return NextResponse.json({ success: true, workflow, idempotency_key: key, result, timestamp: new Date().toISOString() });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message ?? "Internal error" }, { status: 500 });
  }
}

async function processWorkflow(workflow: string, _data: Record<string, unknown>) {
  switch (workflow) {
    case "daily_intelligence":
      return { status: "processing", steps: ["Collecting trends...", "Normalizing signals...", "Discovering products...", "Scoring products...", "Generating CEO recommendations...", "Saving audit trail..."] };
    case "content_production":
      return { status: "processing", steps: ["Creating content idea...", "Generating script...", "Creating creative brief...", "Running compliance check...", "Queuing for human approval..."] };
    case "performance_loop":
      return { status: "processing", steps: ["Analyzing analytics data...", "Running evaluator...", "Calculating finance attribution...", "Generating experiment suggestions...", "Updating memory...", "Feeding results to CEO..."] };
    case "daily_finance":
      return { status: "processing", steps: ["Collecting orders...", "Processing commissions...", "Recording expenses...", "Calculating finance metrics...", "Updating dashboard...", "Checking for anomalies..."] };
    default:
      throw new Error(`Unknown workflow: ${workflow}`);
  }
}
