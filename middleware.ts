/**
 * Middleware — auto-starts Telegram polling on first request.
 */

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { startPolling } from "@/lib/telegram/poller";

let pollingStarted = false;

export function middleware(request: NextRequest) {
  // Auto-start polling on first request (once per server lifecycle)
  if (!pollingStarted && process.env.TELEGRAM_BOT_TOKEN) {
    pollingStarted = true;
    // Don't await — fire and forget
    startPolling();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
