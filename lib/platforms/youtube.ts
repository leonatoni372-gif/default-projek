import type { PlatformAdapter, PublishRequest, PublishResult, AnalyticsQuery, AnalyticsResult } from "./index";

export class YouTubeAdapter implements PlatformAdapter {
  async publish(request: PublishRequest): Promise<PublishResult> {
    // Stub: requires YOUTUBE_API_KEY + channel OAuth
    return {
      platform: "youtube",
      external_id: `yt_stub_${Date.now()}`,
      url: `https://youtube.com/watch?v=stub_${Date.now()}`,
      status: "failed",
      error: "YouTube adapter not configured — set YOUTUBE_API_KEY and OAuth credentials",
    };
  }

  async fetchAnalytics(_query: AnalyticsQuery): Promise<AnalyticsResult> {
    return {
      platform: "youtube",
      views: 0,
      likes: 0,
      comments: 0,
      shares: 0,
      clicks: 0,
      fetched_at: new Date().toISOString(),
    };
  }
}
