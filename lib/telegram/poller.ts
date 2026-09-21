/**
 * Telegram polling service — manages long-polling for the bot.
 * Singleton pattern: only one poller runs at a time.
 */

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
        .then((response: { text: string; parseMode?: string }) => sendTelegramMessage(chatId, response.text, response.parseMode))
        .catch(() => {});
    }

    return data.result.length;
  } catch {
    return 0;
  }
}

export function startPolling(): boolean {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token || isPolling) return isPolling;

  isPolling = true;

  // Background polling loop
  (async function loop() {
    while (isPolling) {
      const count = await pollOnce();
      await new Promise((r) => setTimeout(r, count > 0 ? 1000 : 3000));
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
