/**
 * Content Service - Domain layer for content-related operations.
 *
 * Manages the content pipeline: ideas -> scripts -> creative briefs -> compliance -> approval.
 * Uses real Supabase when configured, falls back to mock data.
 */

import { getDb } from "@/lib/supabase/db";

export type ContentItem = {
  id: string;
  idea_id: string;
  title: string;
  script?: string;
  status: "draft" | "under_review" | "approved" | "rejected" | "published" | "evaluated";
  platform?: "youtube" | "tiktok" | "instagram" | "twitter" | "facebook";
  assigned_to?: string;
  created_at: string;
  updated_at: string;
};

export type ContentIdea = {
  id: string;
  title: string;
  description: string;
  product_id: string;
  trend_id?: string;
  status: "ideated" | "in_review" | "approved" | "rejected";
  content_type: "script" | "article" | "video" | "post";
  ai_model?: string;
  ai_prompt_id?: string;
  created_at: string;
  updated_at: string;
};

export type ScriptOutput = {
  title: string;
  hook: string;
  problem: string;
  promise: string;
  product: string;
  proof: string;
  shot_list: string[];
  b_roll_descriptions: string[];
  voice_over: string;
  on_screen_text: string;
  cta: string;
  affiliate_disclosure: string;
  duration: string;
  aspect_ratio: "16:9" | "9:16" | "1:1";
  platform: "youtube" | "tiktok" | "instagram";
};

export class ContentService {
  async createIdea(idea: Omit<ContentIdea, "id" | "created_at" | "updated_at">): Promise<ContentIdea> {
    const now = new Date().toISOString();
    const id = `idea_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const newIdea: ContentIdea = { id, ...idea, created_at: now, updated_at: now };

    const db = getDb();
    if (db) {
      const { data, error } = await db.from("content_ideas").insert(newIdea).select().single();
      if (error) throw error;
      return data as ContentIdea;
    }
    return newIdea;
  }

  async getIdeasByProduct(productId: string): Promise<ContentIdea[]> {
    const db = getDb();
    if (db) {
      const { data, error } = await db.from("content_ideas").select("*").eq("product_id", productId);
      if (error) throw error;
      return (data as ContentIdea[]) || [];
    }
    return [];
  }

  async createItem(item: Omit<ContentItem, "id" | "created_at" | "updated_at">): Promise<ContentItem> {
    const now = new Date().toISOString();
    const id = `content_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const newItem: ContentItem = { id, ...item, created_at: now, updated_at: now };

    const db = getDb();
    if (db) {
      const { data, error } = await db.from("content_items").insert(newItem).select().single();
      if (error) throw error;
      return data as ContentItem;
    }
    return newItem;
  }

  async generateScript(_ideaId: string): Promise<ScriptOutput> {
    return {
      title: "Review: AI Affiliate Tools",
      hook: "Struggling to make money with affiliate marketing? AI can help!",
      problem: "Most affiliate marketers spend hours researching products and creating content that doesn't convert.",
      promise: "Discover the AI tools that top affiliates use to 10x their earnings.",
      product: "AI Affiliate Course",
      proof: "Case studies showing 300% revenue increase using AI-assisted content",
      shot_list: [
        "Opening shot: frustrated marketer looking at stats",
        "B-roll: AI tool interface screenshots",
        "Product demo clip",
        "Results screen with growing numbers",
      ],
      b_roll_descriptions: [
        "Screen recording of AI tool dashboard",
        "Stock footage of people working on laptops",
        "Graphs showing revenue growth",
      ],
      voice_over: "Are you leaving money on the table with your affiliate marketing?",
      on_screen_text: "3 AI Tools That 10x Affiliate Earnings",
      cta: "Get the AI Affiliate Course Today",
      affiliate_disclosure: "This video contains affiliate links. I may earn a commission at no extra cost to you.",
      duration: "60 seconds",
      aspect_ratio: "9:16",
      platform: "tiktok",
    };
  }

  async updateStatus(id: string, status: ContentItem["status"]): Promise<ContentItem | null> {
    const db = getDb();
    if (db) {
      const { data, error } = await db.from("content_items").update({ status, updated_at: new Date().toISOString() }).eq("id", id).select().single();
      if (error) throw error;
      return (data as ContentItem) || null;
    }
    return null;
  }

  async getByStatus(status: ContentItem["status"]): Promise<ContentItem[]> {
    const db = getDb();
    if (db) {
      const { data, error } = await db.from("content_items").select("*").eq("status", status);
      if (error) throw error;
      return (data as ContentItem[]) || [];
    }
    return [];
  }
}

export default new ContentService();
