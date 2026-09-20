import { NextRequest, NextResponse } from "next/server";
import { AgentCallSchema, validateRequest } from "@/lib/zod/schemas";
import { agentCall } from "@/lib/ai/provider";
import orchestrator from "@/agents";

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ success: false, error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = validateRequest(AgentCallSchema, body);
  if (!parsed.success) {
    return NextResponse.json({ success: false, error: parsed.error }, { status: 400 });
  }

  const { agent: agentName, input } = parsed.data;

  try {
    // Use orchestrator.execute() for run logging + typed method dispatch
    const result = await orchestrator.execute(agentName, input);
    return NextResponse.json({ success: true, agent: agentName, result, timestamp: new Date().toISOString() });
  } catch (err: any) {
    // If orchestrator doesn't know the agent, try LLM fallback
    if (err.message?.includes("Unknown agent")) {
      const agent = orchestrator.getAgent(agentName);
      const agentAny = agent as any;
      const sysPrompt: string = typeof agentAny?.getSystemPrompt === "function" ? agentAny.getSystemPrompt() : "";

      if (sysPrompt) {
        const llm = await agentCall(sysPrompt, JSON.stringify(input), { json: true });
        return NextResponse.json({
          success: true,
          agent: agentName,
          result: { llm_response: llm.content, model: llm.model, usage: llm.usage },
          timestamp: new Date().toISOString(),
        });
      }

      return NextResponse.json({ success: false, agent: agentName, error: err.message }, { status: 404 });
    }

    return NextResponse.json({ success: false, agent: agentName, error: err.message ?? "Agent execution failed" }, { status: 500 });
  }
}

export async function GET() {
  const runs = orchestrator.getAgentRuns();
  return NextResponse.json({ success: true, runs, count: runs.length });
}
