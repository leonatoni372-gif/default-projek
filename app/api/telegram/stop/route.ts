/**
 * Stop Telegram auto-polling.
 * GET /api/telegram/stop
 */

import { NextResponse } from "next/server";
import { stopPolling, getPollingStatus } from "@/lib/telegram/poller";

export async function GET() {
  const before = getPollingStatus();
  stopPolling();
  return NextResponse.json({ status: "stopped", was_polling: before.active });
}
