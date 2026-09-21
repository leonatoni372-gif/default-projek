/**
 * Telegram polling service — instant mode (s=0).
 * Minimal delay, fast response. ~200ms typical latency.
 */

import { handleMessage } from "@/lib/bots/handler";

const TELEGRAM_API = "https://api.telegram.org";
const POLL_INTERVAL_MS = 200; // 200ms between polls — fast but respects rate limits

declare global {
  var __tgPolling: boolean | undefined;
  var __tgOffset: number | undefined;
}
function getState() {
  if (globalThis.__tgPolling === undefined) globalThis.__tgPolling = false;
  if (globalThis.__tgOffset === undefined) globalThis.__tgOffset = 0;
  return { isPolling: globalThis.__tgPolling, lastOffset: globalThis.__tgOffset };
}

async function sendTelegramMessage(chatId: string, text: string, parseMode?: string) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) return;

  const trySend = async (mode?: string) => {
    try {
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
      return (data as { ok?: boolean }).ok !== false;
    } catch {
      return false;
    }
  };

  const ok = await trySend(parseMode);
  if (!ok) await trySend(undefined);
}

async function pollOnce(): Promise<boolean> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) return false;
  if (globalThis.__tgOffset === undefined) globalThis.__tgOffset = 0;

  try {
    const url = `${TELEGRAM_API}/bot${token}/getUpdates?offset=${globalThis.__tgOffset + 1}&timeout=1&allowed_updates=["message"]`;
    const res = await fetch(url, { signal: AbortSignal.timeout(5000) });
    const data = await res.json();

    if (!data.ok || !data.result?.length) return false;

    for (const update of data.result) {
      globalThis.__tgOffset = update.update_id;

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
  // Production uses webhook — polling only for localhost dev
  if (process.env.VERCEL) return false;
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (globalThis.__tgPolling === undefined) globalThis.__tgPolling = false;
  if (token && globalThis.__tgPolling) return true;
  if (!token) return false;

  globalThis.__tgPolling = true;

  // Fast polling loop — 200ms between polls
  (async function loop() {
    while (globalThis.__tgPolling) {
      await pollOnce();
      // Minimal delay: 200ms always (keeps API happy, still feels instant)
      await new Promise((r) => setTimeout(r, POLL_INTERVAL_MS));
    }
  })();

  return true;
}

export function stopPolling(): void {
  globalThis.__tgPolling = false;
}

export function getPollingStatus(): { active: boolean; offset: number } {
  return { active: !!globalThis.__tgPolling, offset: globalThis.__tgOffset ?? 0 };
}
