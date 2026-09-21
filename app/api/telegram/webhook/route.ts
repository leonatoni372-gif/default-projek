/**
 * Telegram Bot Webhook — receives messages, routes to agents, sends responses.
 *
 * Setup:
 * 1. Create bot via @BotFather on Telegram, get token
 * 2. Set TELEGRAM_BOT_TOKEN in .env.local
 * 3. Set webhook: POST https://api.telegram.org/bot<TOKEN>/setWebhook?url=<YOUR_APP>/api/telegram/webhook
 * 4. Or use /api/telegram/set-webhook to auto-configure
 */

import { NextRequest, NextResponse } from "next/server";
import { handleMessage } from "@/lib/bots/handler";

const TELEGRAM_API = "https://api.telegram.org";
const WEBHOOK_SECRET = process.env.TELEGRAM_WEBHOOK_SECRET;

// Simple in-memory rate limit: 5 req / 10s per chat
const bucket = new Map<string, number[]>();
function isRateLimited(chatId: string, limit = 5, windowMs = 10000): boolean {
  const now = Date.now();
  const arr = (bucket.get(chatId) || []).filter((t) => now - t < windowMs);
  arr.push(now);
  bucket.set(chatId, arr);
  return arr.length > limit;
}

async function sendTelegramMessage(chatId: string, text: string, parseMode?: string) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) return;

  // Try with parseMode first, fallback to plain text if Telegram rejects
  const trySend = async (mode?: string) => {
    const res = await fetch(`${TELEGRAM_API}/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text: mode ? text : text.replace(/\*/g, ""),
        ...(mode ? { parse_mode: mode } : {}),
      }),
    });
    const data = await res.json().catch(() => ({}));
    return { ok: res.ok, data };
  };

  const first = await trySend(parseMode);
  if (!first.ok) {
    // Fallback: plain text without markdown
    await trySend(undefined);
  }
}

// POST — receive webhook from Telegram
export async function POST(request: NextRequest) {
  const token = process.env.TELEGRAM_BOT_TOKEN;

  // Verify secret header if configured (prevents spoofed updates)
  if (WEBHOOK_SECRET) {
    const got = request.headers.get("x-telegram-bot-api-secret-token");
    if (got !== WEBHOOK_SECRET) return NextResponse.json({ ok: false }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: true });
  }

  const update = body as Record<string, unknown>;
  const message = update.message as Record<string, unknown> | undefined;
  if (!message) return NextResponse.json({ ok: true });

  const chat = message.chat as Record<string, unknown>;
  const chatId = String(chat?.id || "");
  const text = String(message.text || "");

  if (!text || !chatId) return NextResponse.json({ ok: true });
  if (isRateLimited(chatId)) return NextResponse.json({ ok: true }); // silent drop on spam

  // Process message
  const response = await handleMessage({
    platform: "telegram",
    userId: chatId,
    text,
  });

  // Send response back (only if token is configured)
  if (token) {
    await sendTelegramMessage(chatId, response.text, response.parseMode);
  }

  return NextResponse.json({ ok: true, response: response.text });
}

// GET — set webhook automatically
export async function GET() {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) {
    return NextResponse.json({ error: "TELEGRAM_BOT_TOKEN not set. Add it to .env.local first." }, { status: 400 });
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const webhookUrl = `${appUrl}/api/telegram/webhook`;

  const url = `${TELEGRAM_API}/bot${token}/setWebhook?url=${encodeURIComponent(webhookUrl)}${WEBHOOK_SECRET ? `&secret_token=${WEBHOOK_SECRET}` : ""}`;
  const res = await fetch(url, { method: "POST" });

  const data = await res.json();
  return NextResponse.json({ success: true, webhook_url: webhookUrl, telegram_response: data });
}
