/**
 * CEO / Orchestrator Agent - The main decision-making agent.
 * 
 * Purpose: Review overall state, prioritize opportunities, and recommend actions.
 * Forbidden: bypassing approvals, publishing, spending money without human approval.
 * 
 * Input: system state, metrics, opportunities, constraints
 * Output: prioritized recommendations, rationale, next actions
 */

export type SystemState = {
  revenue: number;
  profit: number;
  orders: number;
  commissions: number;
  expenses: number;
  views: number;
  clicks: number;
  active_experiments: number;
  pending_approvals: number;
  products: ProductSummary[];
  recent_ai_decisions: AIDecisionSummary[];
};

export type ProductSummary = {
  id: string;
  name: string;
  overall_score: number;
  status: string;
};

export type AIDecisionSummary = {
  id: string;
  decision_type: string;
  outcome: string;
  created_at: string;
};

export type Opportunity = {
  title: string;
  description: string;
  potentialImpact: 'high' | 'medium' | 'low';
  riskLevel: 'high' | 'medium' | 'low';
};

export type OrchestratorInput = {
  state: SystemState;
  new_opportunities: Opportunity[];
  constraints: Constraint[];
};

export type OrchestratorOutput = {
  priorities: PriorityRecommendation[];
  rationale: string[];
  forbidden_actions: ForbiddenAction[];
};

export type PriorityRecommendation = {
  type: 'product_research' | 'content_creation' | 'experiment' | 'finance_review' | 'compliance_review';
  title: string;
  description: string;
  urgency: 'high' | 'medium' | 'low';
  expected_impact: 'high' | 'medium' | 'low';
};

export type ForbiddenAction = {
  action: 'publish' | 'spend' | 'manipulate';
  reason: string;
};

export type Constraint = {
  name: string;
  description: string;
  enforced: boolean;
};

export class CEOAgent {
  // private supabase: ReturnType<typeof createClient>;

  constructor() {
    // this.supabase = supabase;
  }

  /**
   * Process system state and opportunities, return priorities
   */
  async analyze(state: SystemState, opportunities: Opportunity[], constraints: Constraint[]): Promise<OrchestratorOutput> {
    const priorities: PriorityRecommendation[] = [];
    const rationale: string[] = [];
    const forbiddenActions: ForbiddenAction[] = [];

    // Analyze financial state
    const financialAnalysis = this.analyzeFinance(state);
    rationale.push(...financialAnalysis.rationale);

    if (financialAnalysis.needsAttention) {
      priorities.push({
        type: 'finance_review',
        title: 'Review financial performance',
        description: 'Net profit is below expectations. Review expenses and commission rates.',
        urgency: 'high',
        expected_impact: 'medium',
      });
    }

    // Analyze opportunities
    for (const opp of opportunities) {
      if (opp.potentialImpact === 'high' && opp.riskLevel === 'low') {
        priorities.push({
          type: 'product_research',
          title: `Research high-potential product: ${opp.title}`,
          description: opp.description,
          urgency: 'high',
          expected_impact: 'high',
        });
      }
    }

    // Check for pending approvals
    if (state.pending_approvals > 0) {
      priorities.push({
        type: 'compliance_review',
        title: 'Review pending approvals',
        description: `${state.pending_approvals} items awaiting human approval`,
        urgency: 'high',
        expected_impact: 'high',
      });
    }

    // Identify forbidden actions based on constraints
    constraints.forEach(constraint => {
      if (!constraint.enforced) {
        forbiddenActions.push({
          action: constraint.name as 'publish' | 'spend' | 'manipulate',
          reason: `Constraint "${constraint.name}" not actively enforced but should be monitored`,
        });
      }
    });

    // Always add the core forbidden rule
    forbiddenActions.push({
      action: 'publish',
      reason: 'Human approval required before publishing any content',
    });
    forbiddenActions.push({
      action: 'spend',
      reason: 'Human approval required before spending money on promotion',
    });

    return {
      priorities,
      rationale,
      forbidden_actions: forbiddenActions,
    };
  }

  private analyzeFinance(state: SystemState) {
    const rationale: string[] = [];
    let needsAttention = false;

    const profitMargin = state.revenue > 0 ? (state.profit / state.revenue) * 100 : 0;
    rationale.push(`Current profit margin: ${profitMargin.toFixed(1)}%`);

    if (profitMargin < 10) {
      needsAttention = true;
      rationale.push('WARNING: Profit margin below 10% - urgent review needed');
    }

    if (state.expenses > state.commissions * 0.5) {
      needsAttention = true;
      rationale.push('WARNING: Expenses are more than 50% of commissions');
    }

    return { rationale, needsAttention };
  }

  /**
   * Generate system prompt for the CEO agent
   */
  getSystemPrompt(): string {
    return `You are the AI CEO / Orchestrator for the AI Affiliate Operating System.

Your role is to oversee the entire affiliate marketing operation and recommend the next best actions.

CORE PRINCIPLES:
1. NEVER bypass human approval for publishing or spending
2. NEVER make claims that cannot be supported by evidence
3. ALWAYS prioritize transparency and compliance
4. Focus on measurable, repeatable patterns
5. Recommend actions, but never make the final decision for the user

INPUT you receive:
- Current system state (revenue, profit, orders, commissions, expenses, views, clicks)
- New opportunities (product research, content ideas, experiments)
- Constraints (approval requirements, compliance rules, budget limits)

OUTPUT you must provide:
- Prioritized recommendations (what to work on next)
- Rationale for each recommendation
- Forbidden actions that must not be taken

FORBIDDEN:
- Publishing content without human approval
- Spending money without explicit user consent
- Making deceptive claims in content
- Bypassing compliance checks

Remember: You are an advisor, not an autonomous actor. Your recommendations enable the human operator to make informed decisions.`;
  }
}

export default new CEOAgent();