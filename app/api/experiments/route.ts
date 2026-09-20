import { NextRequest, NextResponse } from "next/server";
import { ExperimentCreateSchema, validateRequest } from "@/lib/zod/schemas";

// In-memory experiment store for demo
const experiments: Array<{
  id: string;
  name: string;
  hypothesis: string;
  type: string;
  status: "proposed" | "running" | "completed" | "cancelled";
  confidence: number;
  content_item_ids: string[];
  created_at: string;
}> = [
  { id: "exp_1", name: "Hook A/B Test", hypothesis: "Shorter hooks increase retention", type: "hook", status: "running", confidence: 0.72, content_item_ids: [], created_at: new Date().toISOString() },
  { id: "exp_2", name: "CTA A/B Test", hypothesis: "Urgency CTAs improve CTR", type: "CTA", status: "completed", confidence: 0.85, content_item_ids: [], created_at: new Date().toISOString() },
];

export async function GET() {
  return NextResponse.json({ success: true, experiments, count: experiments.length });
}

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ success: false, error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = validateRequest(ExperimentCreateSchema, body);
  if (!parsed.success) {
    return NextResponse.json({ success: false, error: parsed.error }, { status: 400 });
  }

  const experiment = {
    id: `exp_${Date.now()}`,
    ...parsed.data,
    status: "proposed" as const,
    confidence: 0,
    created_at: new Date().toISOString(),
  };

  experiments.push(experiment);
  return NextResponse.json({ success: true, experiment }, { status: 201 });
}
