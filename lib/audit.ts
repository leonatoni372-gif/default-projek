/**
 * Audit Log Utilities
 * 
 * Every important automated action needs an audit log.
 * Structured logging for AI decisions and agent runs.
 */

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
  status: 'started' | 'completed' | 'failed' | 'cancelled';
  input_data: any;
  output_data: any;
  error_message?: string;
  token_usage?: number;
  cost?: number;
  duration_ms?: number;
  started_at: string;
  completed_at?: string;
};

export class AuditLogger {
  private logs: AuditEntry[] = [];
  private agentRuns: AgentRunLog[] = [];

  /**
   * Log an automated action
   */
  log(action: string, entityType: string, entityId: string, details: Record<string, any>, userId?: string): AuditEntry {
    const entry: AuditEntry = {
      id: `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      action,
      entity_type: entityType,
      entity_id: entityId,
      user_id: userId,
      details,
      created_at: new Date().toISOString(),
    };
    this.logs.push(entry);
    return entry;
  }

  /**
   * Log an agent run
   */
  logAgentRun(run: Omit<AgentRunLog, 'id' | 'started_at'>): AgentRunLog {
    const entry: AgentRunLog = {
      id: `run_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      ...run,
      started_at: new Date().toISOString(),
    };
    this.agentRuns.push(entry);
    return entry;
  }

  /**
   * Get all audit logs
   */
  getLogs(): AuditEntry[] {
    return this.logs;
  }

  /**
   * Get all agent run logs
   */
  getAgentRuns(): AgentRunLog[] {
    return this.agentRuns;
  }

  /**
   * Get logs for a specific entity
   */
  getByEntity(entityType: string, entityId: string): AuditEntry[] {
    return this.logs.filter(l => l.entity_type === entityType && l.entity_id === entityId);
  }
}

export default new AuditLogger();