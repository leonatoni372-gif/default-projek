/**
 * Approval Service - Domain layer for human approval workflow.
 * 
 * Manages the approval gate for publishing and spending actions.
 * Human approval is required for publishing, paid promotion, and spending money in V1.
 * No autonomous publishing until provider is configured and user enables it.
 */

export type ApprovalStatus = 'pending' | 'approved' | 'rejected';

export type Approval = {
  id: string;
  content_item_id: string;
  user_id: string; // The user who needs to approve
  approver_id?: string; // The user who approved/rejected
  status: ApprovalStatus;
  compliance_status: 'PASS' | 'NEEDS_REVISION' | 'BLOCKED';
  compliance_issues?: any[];
  approved_at?: string;
  created_at: string;
  reason?: string;
};

export type ApprovalQueueItem = {
  id: string;
  content_item_id: string;
  title: string;
  platform: string;
  compliance_status: 'PASS' | 'NEEDS_REVISION' | 'BLOCKED';
  created_at: string;
};

export class ApprovalService {
  // private supabase: ReturnType<typeof createClient>;

  constructor() {
    // this.supabase = supabase;
  }

  /**
   * Create a new approval request
   */
  async createApproval(approval: Omit<Approval, 'id' | 'created_at'>): Promise<Approval> {
    const id = `approval_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const newApproval: Approval = {
      id,
      ...approval,
      created_at: new Date().toISOString(),
    };
    return newApproval;
  }

  /**
   * Approve an approval request
   */
  async approve(approvalId: string, approverId: string): Promise<Approval | null> {
    // In production, would update in Supabase
    // const { data, error } = await this.supabase
    //   .from('approvals')
    //   .update({ status: 'approved', approver_id: approverId, approved_at: new Date().toISOString() })
    //   .eq('id', approvalId)
    //   .select()
    //   .single();

    // if (error) throw error;
    // return data || null;

    return null; // Demo mode
  }

  /**
   * Reject an approval request
   */
  async reject(approvalId: string, reason: string): Promise<Approval | null> {
    // const { data, error } = await this.supabase
    //   .from('approvals')
    //   .update({ status: 'rejected', reason, updated_at: new Date().toISOString() })
    //   .eq('id', approvalId)
    //   .select()
    //   .single();

    // if (error) throw error;
    // return data || null;

    return null; // Demo mode
  }

  /**
   * Get approval by content item ID
   */
  async getByContentItem(contentItemId: string): Promise<Approval | null> {
    // const { data, error } = await this.supabase
    //   .from('approvals')
    //   .select('*')
    //   .eq('content_item_id', contentItemId)
    //   .single();

    // if (error) throw error;
    // return data || null;

    return null; // Demo mode
  }

  /**
   * Get approval queue for a user
   */
  async getQueue(userId: string): Promise<ApprovalQueueItem[]> {
    // const { data, error } = await this.supabase
    //   .from('approvals')
    //   .select('content_items(title), *, content_items_id')
    //   .eq('user_id', userId)
    //   .eq('status', 'pending');

    // if (error) throw error;
    // return data || [];

    return []; // Demo mode
  }

  /**
   * Check if content can be published (has PASS compliance and approved approval)
   */
  async canPublish(contentItemId: string): Promise<{ canPublish: boolean; reason?: string }> {
    // 1. Check compliance
    // const compliance = await this.complianceService.check(contentItemId);
    // if (compliance.status !== 'PASS') {
    //   return { canPublish: false, reason: `Compliance: ${compliance.status}` };
    // }

    // 2. Check approval
    // const approval = await this.getByContentItem(contentItemId);
    // if (!approval || approval.status !== 'approved') {
    //   return { canPublish: false, reason: 'Not approved by human' };
    // }

    // 3. Check provider is configured
    // const provider = await this.platformAccountsService.getConfiguredProvider();
    // if (!provider) {
    //   return { canPublish: false, reason: 'No platform provider configured' };
    // }

    // In demo mode, return false until explicitly enabled
    return { canPublish: false, reason: 'Approval not granted - human-in-the-loop required' };
  }
}

export default new ApprovalService();