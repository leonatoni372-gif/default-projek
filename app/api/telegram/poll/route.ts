/**
 * Telegram manual poll — process pending messages on-demand.
 * GET /api/telegram/poll
 */

import { NextResponse } from "next/server";
import { getPollingStatus } from "@/lib/telegram/poller";

export async function GET() {
  const status = getPollingStatus();
  return NextResponse.json({
    polling: status.active,
    offset: status.offset,
    message: status.active ? "Auto-polling is active." : "Auto-polling is stopped. Visit /api/telegram/start to begin.",
  });
}
