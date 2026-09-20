/**
 * Test bot handler directly — simulates a Telegram message.
 * POST /api/telegram/test { "text": "/help" }
 */

import { NextRequest, NextResponse } from "next/server";
import { handleMessage } from "@/lib/bots/handler";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const text = body.text || "/help";
  const chatId = body.chatId || "test_user";

  const response = await handleMessage({
    platform: "telegram",
    userId: chatId,
    text,
  });

  return NextResponse.json({ input: text, response: response.text });
}
