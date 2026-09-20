/**
 * Telegram Auto-Poll — keeps running and processes messages automatically.
 * Call GET /api/telegram/start to begin polling in background.
 * Uses long-polling with offset tracking.
 */

import { NextResponse } from "next/server";
import { handleMessage } from "@/lib/bots/handler";

const TELEGRAM_API = "https://api.telegram.org";

let isPolling = false;
let lastOffset = 0;

async function sendTelegramMessage(chatId: string, text: string, parseMode?: string) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) return;

  try {
    await fetch(`${TELEGRAM_API}/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: parseMode || "HTML",
      }),
    });
  } catch {
    // ignore send errors
  }
}

async function pollOnce(): Promise<number> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) return 0;

  try {
    const url = `${TELEGRAM_API}/bot${token}/getUpdates?offset=${lastOffset + 1}&timeout=5&allowed_updates=["message"]`;
    const res = await fetch(url, { signal: AbortSignal.timeout(10000) });
    const data = await res.json();

    if (!data.ok || !data.result?.length) return 0;

    for (const update of data.result) {
      lastOffset = update.update_id;

      const message = update.message;
      if (!message?.text || !message?.chat?.id) continue;

      const chatId = String(message.chat.id);
      const text = String(message.text);

      // Process in background (don't block next poll)
      handleMessage({ platform: "telegram", userId: chatId, text })
        .then((response) => sendTelegramMessage(chatId, response.text, response.parseMode))
        .catch(() => {});
    }

    return data.result.length;
  } catch {
    return 0;
  }
}

export async function GET() {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) {
    return NextResponse.json({ error: "TELEGRAM_BOT_TOKEN not set" }, { status: 400 });
  }

  if (isPolling) {
    return NextResponse.json({ status: "already_polling", offset: lastOffset });
  }

  isPolling = true;

  // Background polling loop
  (async function loop() {
    while (isPolling) {
      const count = await pollOnce();
      // Short sleep between polls (1 second if messages found, 3 seconds if idle)
      await new Promise((r) => setTimeout(r, count > 0 ? 1000 : 3000));
    }
  })();

  return NextResponse.json({ status: "started", message: "Auto-polling started. Send a message to @affliatesukses_bot now." });
}
