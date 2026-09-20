/**
 * Telegram Bot Polling — fetches messages via getUpdates, processes, sends responses.
 * No webhook needed. Just hit this endpoint periodically or run a cron job.
 *
 * Usage:
 *   GET /api/telegram/poll — processes all pending messages
 *   POST /api/telegram/poll — same
 */

import { NextResponse } from "next/server";
import { handleMessage } from "@/lib/bots/handler";

const TELEGRAM_API = "https://api.telegram.org";

async function sendTelegramMessage(chatId: string, text: string, parseMode?: string) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) return;

  await fetch(`${TELEGRAM_API}/bot${token}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: chatId,
      text,
      parse_mode: parseMode || "HTML",
    }),
  });
}

export async function GET() {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) {
    return NextResponse.json({ error: "TELEGRAM_BOT_TOKEN not set" }, { status: 400 });
  }

  try {
    // Get pending updates
    const updatesRes = await fetch(`${TELEGRAM_API}/bot${token}/getUpdates?timeout=2&allowed_updates=["message"]`);
    const updatesData = await updatesRes.json();

    if (!updatesData.ok) {
      return NextResponse.json({ error: "Failed to get updates", details: updatesData }, { status: 500 });
    }

    const updates = updatesData.result || [];
    const processed: string[] = [];

    for (const update of updates) {
      const message = update.message;
      if (!message?.text || !message?.chat?.id) continue;

      const chatId = String(message.chat.id);
      const text = String(message.text);

      // Process message
      const response = await handleMessage({
        platform: "telegram",
        userId: chatId,
        text,
      });

      // Send response
      await sendTelegramMessage(chatId, response.text, response.parseMode);
      processed.push(`${chatId}: ${text}`);
    }

    // Acknowledge processed updates
    if (updates.length > 0) {
      const lastUpdateId = updates[updates.length - 1].update_id;
      await fetch(`${TELEGRAM_API}/bot${token}/getUpdates?offset=${lastUpdateId + 1}`);
    }

    return NextResponse.json({
      success: true,
      processed: processed.length,
      messages: processed,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
