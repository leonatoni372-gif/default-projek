/**
 * Stop Telegram auto-polling.
 * GET /api/telegram/stop
 */

import { NextResponse } from "next/server";

// Shared polling state — imported from start route via global
declare global {
  var __tgPolling: boolean;
}

export async function GET() {
  globalThis.__tgPolling = false;
  return NextResponse.json({ status: "stopped", message: "Auto-polling stopped." });
}
