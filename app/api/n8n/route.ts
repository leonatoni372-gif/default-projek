import { NextRequest, NextResponse } from "next/server";
import { N8nRequestSchema, validateRequest } from "@/lib/zod/schemas";
import orchestrator from "@/agents";
import auditLog from "@/lib/audit";

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

    // Persist automation run to Supabase
    const db = (await import("@/lib/supabase/db")).getDb();
    if (db) {
      await db.from("automation_runs").insert({
        workflow_name: workflow,
        status: "completed",
        trigger_event: "n8n_webhook",
        input_data: data,
        output_data: result,
        idempotency_key: key,
        completed_at: new Date().toISOString(),
      });
    }

    await auditLog.log(`workflow.${workflow}`, "automation", key, { workflow, result });

    return NextResponse.json({ success: true, workflow, idempotency_key: key, result, timestamp: new Date().toISOString() });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal error";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

async function processWorkflow(workflow: string, data: Record<string, unknown>) {
  switch (workflow) {
    case "daily_intelligence": {
      const [trends, products] = await Promise.all([
        orchestrator.execute("trend", data),
        orchestrator.execute("productResearch", data),
      ]);
      const scored = await orchestrator.execute("productScoring", { products, trends });
      const ceo = await orchestrator.execute("ceo", { action: "daily_recommendations", trends, products, scored });
      return { status: "completed", trends, products, scored, recommendations: ceo };
    }
    case "content_production": {
      const idea = await orchestrator.execute("content", { action: "generate_idea", ...data });
      const brief = await orchestrator.execute("creative", { idea });
      return { status: "completed", idea, brief };
    }
    case "performance_loop": {
      const analysis = await orchestrator.execute("evaluator", { action: "analyze_performance", ...data });
      const experiments = await orchestrator.execute("experiment", { analysis });
      return { status: "completed", analysis, experiments };
    }
    case "daily_finance": {
      const finance = await orchestrator.execute("finance", { action: "daily_summary", ...data });
      return { status: "completed", finance };
    }
    default:
      throw new Error(`Unknown workflow: ${workflow}`);
  }
}
