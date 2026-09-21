/**
 * Telegram polling service — instant mode (s=0).
 * Minimal delay, fast response. ~200ms typical latency.
 */

import { handleMessage } from "@/lib/bots/handler";

const TELEGRAM_API = "https://api.telegram.org";
const POLL_INTERVAL_MS = 200; // 200ms between polls — fast but respects rate limits

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

async function pollOnce(): Promise<boolean> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) return false;

  try {
    const url = `${TELEGRAM_API}/bot${token}/getUpdates?offset=${lastOffset + 1}&timeout=1&allowed_updates=["message"]`;
    const res = await fetch(url, { signal: AbortSignal.timeout(5000) });
    const data = await res.json();

    if (!data.ok || !data.result?.length) return false;

    for (const update of data.result) {
      lastOffset = update.update_id;

      const message = update.message;
      if (!message?.text || !message?.chat?.id) continue;

      const chatId = String(message.chat.id);
      const text = String(message.text);

      // Process synchronously — reply in order
      try {
        const response = await handleMessage({ platform: "telegram", userId: chatId, text });
        await sendTelegramMessage(chatId, response.text, response.parseMode);
      } catch {
        // ignore per-message errors
      }
    }

    return true;
  } catch {
    return false;
  }
}

export function startPolling(): boolean {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token || isPolling) return isPolling;

  isPolling = true;

  // Fast polling loop — 200ms between polls
  (async function loop() {
    while (isPolling) {
      const hadMessages = await pollOnce();
      // Minimal delay: 200ms always (keeps API happy, still feels instant)
      await new Promise((r) => setTimeout(r, POLL_INTERVAL_MS));
    }
  })();

  return true;
}

export function stopPolling(): void {
  isPolling = false;
}

export function getPollingStatus(): { active: boolean; offset: number } {
  return { active: isPolling, offset: lastOffset };
}
