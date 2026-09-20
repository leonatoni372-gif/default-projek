import { NextRequest, NextResponse } from "next/server";
import { AgentCallSchema, validateRequest } from "@/lib/zod/schemas";
import { agentCall } from "@/lib/ai/provider";
import { getAgent } from "@/agents";

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

  const agent = getAgent(agentName);
  if (!agent) {
    return NextResponse.json({ success: false, error: `Unknown agent: ${agentName}` }, { status: 404 });
  }

  const agentAny = agent as any;
  const sysPrompt: string = typeof agentAny.getSystemPrompt === "function" ? agentAny.getSystemPrompt() : "";

  // Run the agent's own method first, fall back to LLM call if it has one
  try {
    let result: unknown;

    // Prefer the agent's typed method
    if (typeof agentAny.research === "function") {
      result = await agentAny.research(input);
    } else if (typeof agentAny.analyze === "function") {
      result = await agentAny.analyze(input);
    } else if (typeof agentAny.score === "function") {
      result = await agentAny.score(input);
    } else if (typeof agentAny.check === "function") {
      result = await agentAny.check(input);
    } else if (typeof agentAny.generateIdeas === "function") {
      result = await agentAny.generateIdeas(input);
    } else if (typeof agentAny.generateBrief === "function") {
      result = await agentAny.generateBrief(input);
    } else if (typeof agentAny.calculate === "function") {
      result = await agentAny.calculate(input);
    } else if (typeof agentAny.create === "function") {
      result = await agentAny.create(input);
    } else if (typeof agentAny.interpret === "function") {
      result = await agentAny.interpret(input);
    } else if (typeof agentAny.store === "function") {
      result = await agentAny.store(input);
    } else if (sysPrompt) {
      // No typed method — call LLM with system prompt
      const llm = await agentCall(sysPrompt, JSON.stringify(input), { json: true });
      result = { llm_response: llm.content, model: llm.model, usage: llm.usage };
    } else {
      result = { status: "no handler for this agent" };
    }

    return NextResponse.json({ success: true, agent: agentName, result, timestamp: new Date().toISOString() });
  } catch (err: any) {
    return NextResponse.json({ success: false, agent: agentName, error: err.message ?? "Agent execution failed" }, { status: 500 });
  }
}
