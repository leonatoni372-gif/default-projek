/**
 * Send test message to a Telegram chat.
 * POST /api/telegram/send { "chatId": "7855542168", "text": "hello" }
 */

import { NextRequest, NextResponse } from "next/server";

const TELEGRAM_API = "https://api.telegram.org";

export async function POST(request: NextRequest) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) {
    return NextResponse.json({ error: "TELEGRAM_BOT_TOKEN not set" }, { status: 400 });
  }

  const body = await request.json();
  const chatId = body.chatId;
  const text = body.text;

  if (!chatId || !text) {
    return NextResponse.json({ error: "chatId and text required" }, { status: 400 });
  }

  const res = await fetch(`${TELEGRAM_API}/bot${token}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: chatId,
      text,
      parse_mode: "HTML",
    }),
  });

  const data = await res.json();
  return NextResponse.json({ ok: data.ok, result: data.result });
}
