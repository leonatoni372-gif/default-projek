import type { PlatformAdapter, PublishRequest, PublishResult, AnalyticsQuery, AnalyticsResult } from "./index";

const BASE = "https://graph.facebook.com/v19.0";

export class InstagramAdapter implements PlatformAdapter {
  private getCreds() {
    const token = process.env.INSTAGRAM_ACCESS_TOKEN;
    const igUserId = process.env.INSTAGRAM_USER_ID;
    if (!token || !igUserId) return null;
    return { token, igUserId };
  }

  async publish(request: PublishRequest): Promise<PublishResult> {
    const creds = this.getCreds();
    if (!creds) {
      return { platform: "instagram", external_id: "", url: "", status: "failed", error: "INSTAGRAM_ACCESS_TOKEN or INSTAGRAM_USER_ID not set" };
    }
    try {
      const caption = request.title + "\n\n" + request.description;
      const containerRes = await fetch(`${BASE}/${creds.igUserId}/media`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ caption, media_type: "IMAGE", image_url: request.media_urls?.[0] || "https://via.placeholder.com/1080" }),
      });
      if (!containerRes.ok) {
        const err = await containerRes.text();
        return { platform: "instagram", external_id: "", url: "", status: "failed", error: `IG API error: ${err.slice(0, 200)}` };
      }
      const containerData = await containerRes.json();
      const containerId = containerData.id;

      const publishRes = await fetch(`${BASE}/${creds.igUserId}/media_publish`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ creation_id: containerId }),
      });
      if (!publishRes.ok) {
        return { platform: "instagram", external_id: containerId, url: "", status: "failed", error: "Publish step failed" };
      }
      const pubData = await publishRes.json();
      return { platform: "instagram", external_id: pubData.id, url: `https://instagram.com/p/${pubData.id}`, status: "published" };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Unknown error";
      return { platform: "instagram", external_id: "", url: "", status: "failed", error: message };
    }
  }

  async fetchAnalytics(query: AnalyticsQuery): Promise<AnalyticsResult> {
    const creds = this.getCreds();
    if (!creds) {
      return { platform: "instagram", views: 0, likes: 0, comments: 0, shares: 0, clicks: 0, fetched_at: new Date().toISOString() };
    }
    try {
      const res = await fetch(`${BASE}/${query.external_id}?fields=like_count,comments_count,timestamp&access_token=${creds.token}`);
      if (!res.ok) return { platform: "instagram", views: 0, likes: 0, comments: 0, shares: 0, clicks: 0, fetched_at: new Date().toISOString() };
      const data = await res.json();
      return {
        platform: "instagram",
        views: 0,
        likes: data.like_count || 0,
        comments: data.comments_count || 0,
        shares: 0,
        clicks: 0,
        fetched_at: new Date().toISOString(),
      };
    } catch {
      return { platform: "instagram", views: 0, likes: 0, comments: 0, shares: 0, clicks: 0, fetched_at: new Date().toISOString() };
    }
  }
}
