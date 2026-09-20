/**
 * WhatsApp Bot Webhook — receives messages, routes to agents, sends responses.
 *
 * Setup:
 * 1. Create WhatsApp Business API app at developers.facebook.com
 * 2. Set WHATSAPP_TOKEN and WHATSAPP_PHONE_NUMBER_ID in .env.local
 * 3. Set webhook in Meta dashboard to: <YOUR_APP>/api/whatsapp/webhook
 * 4. Verify token: WHATSAPP_VERIFY_TOKEN
 */

import { NextRequest, NextResponse } from "next/server";
import { handleMessage } from "@/lib/bots/handler";

const GRAPH_API = "https://graph.facebook.com/v19.0";

async function sendWhatsAppMessage(to: string, text: string) {
  const token = process.env.WHATSAPP_TOKEN;
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  if (!token || !phoneNumberId) return;

  await fetch(`${GRAPH_API}/${phoneNumberId}/messages`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      messaging_product: "whatsapp",
      to,
      type: "text",
      text: { body: text },
    }),
  });
}

// POST — receive webhook from WhatsApp (Meta Cloud API)
export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: true });
  }

  const data = body as Record<string, unknown>;
  const entry = (data.entry as Record<string, unknown>[])?.[0];
  const changes = (entry?.changes as Record<string, unknown>[])?.[0];
  const value = changes?.value as Record<string, unknown>;
  const messages = value?.messages as Record<string, unknown>[] | undefined;

  if (!messages?.length) return NextResponse.json({ ok: true });

  const msg = messages[0];
  const from = String(msg.from || "");
  const text = (msg.text as Record<string, unknown>)?.body || "";

  if (!from || !text) return NextResponse.json({ ok: true });

  const response = await handleMessage({
    platform: "whatsapp",
    userId: from,
    text: String(text),
  });

  await sendWhatsAppMessage(from, response.text);

  return NextResponse.json({ ok: true });
}

// GET — Meta webhook verification
export async function GET(request: NextRequest) {
  const mode = request.nextUrl.searchParams.get("hub.mode");
  const token = request.nextUrl.searchParams.get("hub.verify_token");
  const challenge = request.nextUrl.searchParams.get("hub.challenge");

  const verifyToken = process.env.WHATSAPP_VERIFY_TOKEN || "ai-affiliate-os-verify";

  if (mode === "subscribe" && token === verifyToken) {
    return new NextResponse(challenge, { status: 200 });
  }

  return NextResponse.json({ error: "Verification failed" }, { status: 403 });
}
