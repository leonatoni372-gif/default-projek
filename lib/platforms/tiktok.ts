import type { PlatformAdapter, PublishRequest, PublishResult, AnalyticsQuery, AnalyticsResult } from "./index";

export class TikTokAdapter implements PlatformAdapter {
  async publish(request: PublishRequest): Promise<PublishResult> {
    // Stub: requires TIKTOK_ACCESS_TOKEN
    return {
      platform: "tiktok",
      external_id: `tt_stub_${Date.now()}`,
      url: `https://tiktok.com/@user/video/stub_${Date.now()}`,
      status: "failed",
      error: "TikTok adapter not configured — set TIKTOK_ACCESS_TOKEN",
    };
  }

  async fetchAnalytics(_query: AnalyticsQuery): Promise<AnalyticsResult> {
    return {
      platform: "tiktok",
      views: 0,
      likes: 0,
      comments: 0,
      shares: 0,
      clicks: 0,
      fetched_at: new Date().toISOString(),
    };
  }
}
