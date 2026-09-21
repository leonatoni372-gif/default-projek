/**
 * AI Provider Abstraction — supports OpenAI-compatible API + mock fallback.
 *
 * Configured by environment variables:
 *   AI_PROVIDER — "openai-compatible" | "mock"
 *   AI_BASE_URL — API base URL (e.g. https://api.openai.com/v1)
 *   AI_API_KEY  — API key
 *   AI_MODEL    — model name (e.g. gpt-4)
 */

export type AIMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

export type AIResponse = {
  content: string;
  model: string;
  usage: { prompt_tokens: number; completion_tokens: number; total_tokens: number };
};

const RETRY_COUNT = 3;
const RETRY_DELAY_MS = 1000;
const TIMEOUT_MS = 30000;

async function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

async function callOpenAICompatible(
  messages: AIMessage[],
  opts?: { temperature?: number; response_format?: { type: "json_object" } }
): Promise<AIResponse> {
  const baseUrl = process.env.AI_BASE_URL || "https://api.openai.com/v1";
  const apiKey = process.env.AI_API_KEY;
  const model = process.env.AI_MODEL || "gpt-4";

  if (!apiKey) throw new Error("AI_API_KEY is not set");

  for (let attempt = 1; attempt <= RETRY_COUNT; attempt++) {
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

      const res = await fetch(`${baseUrl}/chat/completions`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
        body: JSON.stringify({ model, messages, temperature: opts?.temperature ?? 0.7, response_format: opts?.response_format }),
        signal: controller.signal,
      });

      clearTimeout(timer);

      if (!res.ok) {
        const body = await res.text().catch(() => "");
        throw new Error(`OpenAI API error ${res.status}: ${body.slice(0, 200)}`);
      }

      const data = await res.json();
      const choice = data.choices?.[0];
      if (!choice) throw new Error("No choices returned");

      return {
        content: choice.message?.content ?? "",
        model: data.model ?? model,
        usage: data.usage ?? { prompt_tokens: 0, completion_tokens: 0, total_tokens: 0 },
      };
    } catch (err: any) {
      if (attempt === RETRY_COUNT) throw err;
      await sleep(RETRY_DELAY_MS * attempt);
    }
  }

  throw new Error("unreachable");
}

/**
 * Mock response — deterministic, fast, no network.
 * Returns a valid JSON string when response_format is json_object.
 */
function mockResponse(messages: AIMessage[], opts?: { response_format?: { type: "json_object" } }): AIResponse {
  const lastUser = messages.find((m) => m.role === "user")?.content?.slice(0, 120) ?? "";
  let content: string;

  if (opts?.response_format?.type === "json_object") {
    content = JSON.stringify({ status: "mock", input_preview: lastUser, recommendation: "Demo mode — no real AI call made." });
  } else {
    content = `[mock] I received your message (preview: "${lastUser}"). This is a demo response — configure AI_PROVIDER + AI_API_KEY for real completions.`;
  }

  return { content, model: "mock-model", usage: { prompt_tokens: 0, completion_tokens: 0, total_tokens: 0 } };
}

/**
 * Main entry — routes to real provider or mock based on env.
 */
export async function generateCompletion(
  messages: AIMessage[],
  opts?: { temperature?: number; response_format?: { type: "json_object" } }
): Promise<AIResponse> {
  const provider = (process.env.AI_PROVIDER || "mock").toLowerCase();
  const hasKey = !!process.env.AI_API_KEY;

  if (provider === "openai-compatible" && hasKey) {
    return callOpenAICompatible(messages, opts);
  }

  // Fallback to mock when key missing — bot stays alive without AI
  return mockResponse(messages, opts);
}

/**
 * Convenience: get a system prompt from an agent and send user content.
 */
export async function agentCall(
  systemPrompt: string,
  userInput: string,
  opts?: { json?: boolean }
): Promise<AIResponse> {
  const messages: AIMessage[] = [
    { role: "system", content: systemPrompt },
    { role: "user", content: userInput },
  ];
  return generateCompletion(messages, opts?.json ? { response_format: { type: "json_object" } } : undefined);
}
