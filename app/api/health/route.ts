import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    status: 'ok',
    app: 'AI Affiliate OS',
    mode: 'demo',
    timestamp: new Date().toISOString(),
  });
}
