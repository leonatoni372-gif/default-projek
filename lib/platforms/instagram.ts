import type { PlatformAdapter, PublishRequest, PublishResult, AnalyticsQuery, AnalyticsResult } from "./index";

export class InstagramAdapter implements PlatformAdapter {
  async publish(request: PublishRequest): Promise<PublishResult> {
    // Stub: requires INSTAGRAM_ACCESS_TOKEN + business account
    return {
      platform: "instagram",
      external_id: `ig_stub_${Date.now()}`,
      url: `https://instagram.com/p/stub_${Date.now()}`,
      status: "failed",
      error: "Instagram adapter not configured — set INSTAGRAM_ACCESS_TOKEN and business account",
    };
  }

  async fetchAnalytics(_query: AnalyticsQuery): Promise<AnalyticsResult> {
    return {
      platform: "instagram",
      views: 0,
      likes: 0,
      comments: 0,
      shares: 0,
      clicks: 0,
      fetched_at: new Date().toISOString(),
    };
  }
}
