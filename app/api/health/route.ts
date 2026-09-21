import { NextResponse } from "next/server";
import { getPollingStatus } from "@/lib/telegram/poller";

export async function GET() {
  const checks: Record<string, string> = {};

  // Bot token
  checks.telegram = process.env.TELEGRAM_BOT_TOKEN ? "configured" : "missing";

  // Supabase
  const hasSupabase = !!(process.env.NEXT_PUBLIC_SUPABASE_URL && (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY));
  checks.supabase = hasSupabase ? "configured" : "missing";

  // Polling
  const pollStatus = getPollingStatus();
  checks.polling = pollStatus.active ? "active" : "stopped";

  const healthy = checks.telegram === "configured" && checks.supabase === "configured";

  return NextResponse.json({
    status: healthy ? "ok" : "degraded",
    app: "AI Affiliate OS",
    mode: hasSupabase ? "live" : "demo",
    checks,
    timestamp: new Date().toISOString(),
  });
}
