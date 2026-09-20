/**
 * Creative Service - Domain layer for creative asset operations.
 * Uses real Supabase when configured, falls back to mock data.
 */

import { getDb } from "@/lib/supabase/db";

export type CreativeBrief = {
  id: string;
  content_item_id: string;
  hook: string;
  audience: string;
  problem: string;
  promise: string;
  product: string;
  proof_type: "case_study" | "testimonial" | "demo" | "data" | "none";
  shot_list: string[];
  b_roll: string[];
  voice_over: string;
  on_screen_text: string;
  cta: string;
  affiliate_disclosure: string;
  duration: string;
  aspect_ratio: "16:9" | "9:16" | "1:1";
  platform: "youtube" | "tiktok" | "instagram" | "twitter" | "facebook";
  created_at: string;
};

export type AssetGenerationRequest = {
  asset_type: "thumbnail" | "cover_image" | "b_roll" | "voiceover" | "music";
  brief: CreativeBrief;
  style_preferences?: { color_scheme?: string; tone?: "energetic" | "professional" | "casual" | "urgent" };
};

export type AssetResult = {
  asset_type: string;
  file_url: string;
  generation_prompt: string;
  status: "pending" | "generating" | "ready" | "failed";
  error?: string;
};

export class CreativeService {
  async createBrief(brief: Omit<CreativeBrief, "id" | "created_at">): Promise<CreativeBrief> {
    const id = `brief_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const newBrief: CreativeBrief = { id, ...brief, created_at: new Date().toISOString() };

    const db = getDb();
    if (db) {
      const { error } = await db.from("creative_assets").insert({ content_item_id: brief.content_item_id, asset_type: "b_roll", status: "ready" });
      if (error) throw error;
    }
    return newBrief;
  }

  async generateFromIdea(_ideaId: string): Promise<CreativeBrief> {
    return {
      id: `brief_${Date.now()}`, content_item_id: `content_${Date.now()}`,
      hook: "Ready to 10x your affiliate income?", audience: "Aspiring affiliate marketers",
      problem: "Most people fail at affiliate marketing because they promote wrong products.",
      promise: "Learn the exact framework top affiliates use.", product: "AI Affiliate Course",
      proof_type: "case_study", shot_list: ["Hook", "Problem", "Solution", "Proof", "CTA"],
      b_roll: ["Screen recording", "Stock footage", "Graphs"],
      voice_over: "Want to know the secret to affiliate marketing success?",
      on_screen_text: "AI Affiliate Marketing", cta: "Start Your Affiliate Journey Today",
      affiliate_disclosure: "This content is for educational purposes.", duration: "90 seconds",
      aspect_ratio: "9:16", platform: "tiktok", created_at: new Date().toISOString(),
    };
  }

  async generateAsset(request: AssetGenerationRequest): Promise<AssetResult> {
    const result: AssetResult = {
      asset_type: request.asset_type,
      file_url: `/assets/mock_${request.asset_type}_${Date.now()}.jpg`,
      generation_prompt: `Mock ${request.asset_type} for: ${request.brief.hook}`,
      status: "ready",
    };

    const db = getDb();
    if (db) {
      const { error } = await db.from("creative_assets").insert({
        content_item_id: request.brief.content_item_id, asset_type: request.asset_type,
        file_url: result.file_url, generation_prompt: result.generation_prompt, status: "ready",
      });
      if (error) throw error;
    }
    return result;
  }

  async getBrief(id: string): Promise<CreativeBrief | null> {
    const db = getDb();
    if (db) {
      const { data, error } = await db.from("creative_assets").select("*").eq("id", id).single();
      if (error) throw error;
      return (data as CreativeBrief) || null;
    }
    return null;
  }
}

export default new CreativeService();
