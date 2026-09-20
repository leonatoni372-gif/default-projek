/**
 * Audit Log Utilities
 *
 * Every important automated action needs an audit log.
 * Structured logging for AI decisions and agent runs.
 * Persists to Supabase when configured, falls back to in-memory.
 */

import { getSupabaseServer } from "./supabase/server";

export type AuditEntry = {
  id: string;
  action: string;
  entity_type: string;
  entity_id: string;
  user_id?: string;
  details: Record<string, any>;
  ip?: string;
  created_at: string;
};

export type AgentRunLog = {
  id: string;
  agent_name: string;
  status: "started" | "completed" | "failed" | "cancelled";
  input_data: any;
  output_data: any;
  error_message?: string;
  token_usage?: number;
  cost?: number;
  duration_ms?: number;
  started_at: string;
  completed_at?: string;
};

function genId(prefix: string): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

class AuditLogger {
  private logs: AuditEntry[] = [];
  private agentRuns: AgentRunLog[] = [];

  /**
   * Log an automated action. Writes to Supabase `ai_decisions` table if configured.
   */
  async log(
    action: string,
    entityType: string,
    entityId: string,
    details: Record<string, any>,
    userId?: string
  ): Promise<AuditEntry> {
    const entry: AuditEntry = {
      id: genId("audit"),
      action,
      entity_type: entityType,
      entity_id: entityId,
      user_id: userId,
      details,
      created_at: new Date().toISOString(),
    };

    this.logs.push(entry);

    const supabase = getSupabaseServer();
    if (supabase) {
      try {
        await supabase.from("ai_decisions").insert({
          id: entry.id,
          agent_name: action,
          decision_type: entityType,
          input_data: { entity_id: entityId, ...details },
          output_data: entry,
          confidence: details.confidence ?? null,
          reasoning: details.reasoning ?? null,
          user_id: userId ?? null,
        });
      } catch {
        // Supabase write failed — entry still lives in memory
      }
    }

    return entry;
  }

  /**
   * Log an agent run. Writes to Supabase `agent_runs` table if configured.
   */
  async logAgentRun(run: Omit<AgentRunLog, "id" | "started_at">): Promise<AgentRunLog> {
    const entry: AgentRunLog = {
      id: genId("run"),
      ...run,
      started_at: new Date().toISOString(),
    };

    this.agentRuns.push(entry);

    const supabase = getSupabaseServer();
    if (supabase) {
      try {
        await supabase.from("agent_runs").insert({
          id: entry.id,
          agent_name: entry.agent_name,
          status: entry.status,
          input_data: entry.input_data,
          output_data: entry.output_data,
          error_message: entry.error_message ?? null,
          token_usage: entry.token_usage ?? null,
          cost: entry.cost ?? null,
          duration_ms: entry.duration_ms ?? null,
        });
      } catch {
        // Supabase write failed — entry still lives in memory
      }
    }

    return entry;
  }

  getLogs(): AuditEntry[] {
    return this.logs;
  }

  getAgentRuns(): AgentRunLog[] {
    return this.agentRuns;
  }

  getByEntity(entityType: string, entityId: string): AuditEntry[] {
    return this.logs.filter((l) => l.entity_type === entityType && l.entity_id === entityId);
  }
}

const auditLogger = new AuditLogger();
export default auditLogger;
