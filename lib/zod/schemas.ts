import { z } from "zod";

export const N8nWorkflowSchema = z.enum([
  "daily_intelligence",
  "content_production",
  "performance_loop",
  "daily_finance",
]);

export const N8nRequestSchema = z.object({
  workflow: N8nWorkflowSchema,
  data: z.record(z.unknown()).default({}),
  idempotencyKey: z.string().min(8).max(128).optional(),
});

export const CreateIdeaSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().min(1).max(2000),
  product_id: z.string().uuid(),
  trend_id: z.string().uuid().optional(),
  content_type: z.enum(["script", "article", "video", "post"]),
});

export const UpdateContentStatusSchema = z.object({
  content_item_id: z.string().uuid(),
  status: z.enum(["draft", "under_review", "approved", "rejected", "published", "evaluated"]),
});

export const ComplianceCheckSchema = z.object({
  content_item_id: z.string().uuid().optional(),
  content_text: z.string().min(1),
  has_affiliate_disclosure: z.boolean(),
  claims: z.array(z.string()).default([]),
  testimonials: z.array(z.string()).default([]),
  scarcity_claims: z.array(z.string()).default([]),
  before_after_content: z.boolean().default(false),
  product_attribution: z.boolean().default(true),
  platform: z.enum(["youtube", "tiktok", "instagram", "twitter", "facebook"]),
});

export const ProductScoringSchema = z.object({
  product: z.object({
    id: z.string(),
    name: z.string(),
    price: z.number().min(0),
    commission_rate: z.number().min(0).max(100),
    historical_performance: z
      .object({ views: z.number(), clicks: z.number(), orders: z.number(), revenue: z.number() })
      .optional(),
  }),
  trend_signals: z
    .array(z.object({ keyword: z.string(), signal_score: z.number().min(-1).max(1) }))
    .optional(),
});

export const ApprovalSchema = z.object({
  content_item_id: z.string().uuid(),
  action: z.enum(["approve", "reject"]),
  reason: z.string().max(1000).optional(),
});

export const PerformanceRecordSchema = z.object({
  content_item_id: z.string().uuid(),
  views: z.number().min(0),
  watch_time: z.number().min(0),
  retention: z.number().min(0).max(100),
  likes: z.number().min(0).default(0),
  comments: z.number().min(0).default(0),
  shares: z.number().min(0).default(0),
  saves: z.number().min(0).default(0),
  profile_visits: z.number().min(0).default(0),
  clicks: z.number().min(0).default(0),
  orders: z.number().min(0).default(0),
  commission: z.number().min(0).default(0),
});

export const AgentCallSchema = z.object({
  agent: z.string().min(1),
  input: z.record(z.unknown()).default({}),
});

export function validateRequest<T extends z.ZodTypeAny>(
  schema: T,
  data: unknown
): { success: true; data: z.infer<T> } | { success: false; error: string } {
  const result = schema.safeParse(data);
  if (result.success) return { success: true, data: result.data };
  return { success: false, error: result.error.issues.map((i) => i.message).join("; ") };
}
