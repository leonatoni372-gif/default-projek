/**
 * Start Telegram auto-polling.
 * GET /api/telegram/start
 */

import { NextResponse } from "next/server";
import { startPolling } from "@/lib/telegram/poller";

export async function GET() {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) {
    return NextResponse.json({ error: "TELEGRAM_BOT_TOKEN not set" }, { status: 400 });
  }

  const started = startPolling();
  return NextResponse.json({
    status: started ? "started" : "already_polling",
    message: started ? "Auto-polling started." : "Already polling.",
  });
}
