/**
 * Middleware — auto-starts Telegram polling on first request.
 */

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { startPolling } from "@/lib/telegram/poller";

export function middleware(request: NextRequest) {
  // Auto-start polling on first request (localhost only — Vercel uses webhook)
  if (process.env.VERCEL) return NextResponse.next();
  if (!(globalThis as unknown as Record<string, unknown>).__tgPolling && process.env.TELEGRAM_BOT_TOKEN) {
    // Don't await — fire and forget
    startPolling();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
