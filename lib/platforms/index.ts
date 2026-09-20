export type Platform = "youtube" | "tiktok" | "instagram" | "twitter" | "facebook";

export type PublishRequest = {
  platform: Platform;
  content_item_id: string;
  title: string;
  description: string;
  tags?: string[];
  scheduled_at?: string;
  media_urls?: string[];
};

export type PublishResult = {
  platform: Platform;
  external_id: string;
  url: string;
  status: "published" | "scheduled" | "failed";
  error?: string;
};

export type AnalyticsQuery = {
  platform: Platform;
  content_item_id: string;
  external_id: string;
  since?: string;
  until?: string;
};

export type AnalyticsResult = {
  platform: Platform;
  views: number;
  likes: number;
  comments: number;
  shares: number;
  clicks: number;
  watch_time?: number;
  retention?: number;
  fetched_at: string;
};

export interface PlatformAdapter {
  publish(request: PublishRequest): Promise<PublishResult>;
  fetchAnalytics(query: AnalyticsQuery): Promise<AnalyticsResult>;
}

export { YouTubeAdapter } from "./youtube";
export { TikTokAdapter } from "./tiktok";
export { InstagramAdapter } from "./instagram";

import { YouTubeAdapter } from "./youtube";
import { TikTokAdapter } from "./tiktok";
import { InstagramAdapter } from "./instagram";

const adapters: Record<Platform, PlatformAdapter> = {
  youtube: new YouTubeAdapter(),
  tiktok: new TikTokAdapter(),
  instagram: new InstagramAdapter(),
  twitter: new YouTubeAdapter(), // stub reuse
  facebook: new YouTubeAdapter(), // stub reuse
};

export function getAdapter(platform: Platform): PlatformAdapter {
  return adapters[platform];
}
