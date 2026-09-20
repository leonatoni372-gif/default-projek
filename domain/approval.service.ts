/**
 * Approval Service - Domain layer for human approval workflow.
 * Uses real Supabase when configured, falls back to mock data.
 */

import { getDb } from "@/lib/supabase/db";

export type ApprovalStatus = "pending" | "approved" | "rejected";

export type Approval = {
  id: string;
  content_item_id: string;
  user_id: string;
  approver_id?: string;
  status: ApprovalStatus;
  compliance_status: "PASS" | "NEEDS_REVISION" | "BLOCKED";
  compliance_issues?: unknown[];
  approved_at?: string;
  created_at: string;
  reason?: string;
};

export type ApprovalQueueItem = {
  id: string;
  content_item_id: string;
  title: string;
  platform: string;
  compliance_status: "PASS" | "NEEDS_REVISION" | "BLOCKED";
  created_at: string;
};

export class ApprovalService {
  async createApproval(approval: Omit<Approval, "id" | "created_at">): Promise<Approval> {
    const id = `approval_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const newApproval: Approval = { id, ...approval, created_at: new Date().toISOString() };

    const db = getDb();
    if (db) {
      const { error } = await db.from("approvals").insert(newApproval);
      if (error) throw error;
    }
    return newApproval;
  }

  async approve(approvalId: string, approverId: string): Promise<Approval | null> {
    const db = getDb();
    if (db) {
      const { data, error } = await db.from("approvals").update({ status: "approved", approver_id: approverId, approved_at: new Date().toISOString() }).eq("id", approvalId).select().single();
      if (error) throw error;
      return (data as Approval) || null;
    }
    return null;
  }

  async reject(approvalId: string, reason: string): Promise<Approval | null> {
    const db = getDb();
    if (db) {
      const { data, error } = await db.from("approvals").update({ status: "rejected", reason }).eq("id", approvalId).select().single();
      if (error) throw error;
      return (data as Approval) || null;
    }
    return null;
  }

  async getByContentItem(contentItemId: string): Promise<Approval | null> {
    const db = getDb();
    if (db) {
      const { data, error } = await db.from("approvals").select("*").eq("content_item_id", contentItemId).single();
      if (error) throw error;
      return (data as Approval) || null;
    }
    return null;
  }

  async getQueue(userId: string): Promise<ApprovalQueueItem[]> {
    const db = getDb();
    if (db) {
      const { data, error } = await db.from("approvals").select("*, content_items(title)").eq("user_id", userId).eq("status", "pending");
      if (error) throw error;
      return (data as ApprovalQueueItem[]) || [];
    }
    return [];
  }

  async canPublish(_contentItemId: string): Promise<{ canPublish: boolean; reason?: string }> {
    return { canPublish: false, reason: "Approval not granted - human-in-the-loop required" };
  }
}

export default new ApprovalService();
