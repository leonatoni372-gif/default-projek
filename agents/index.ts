/**
 * AI Agent System - Orchestrator for all agents.
 * 
 * Each agent has:
 * - purpose
 * - typed input schema
 * - typed output schema
 * - system prompt
 * - tool permissions
 * - logging
 * - error handling
 * 
 * Agent permissions are explicit.
 */

export { CEOAgent } from './ceo.agent';
export { TrendAgent } from './trend.agent';
export { ProductResearchAgent } from './product-research.agent';
export { ProductScoringAgent } from './product-scoring.agent';
export { FinanceAgent } from './finance.agent';
export { ContentAgent } from './content.agent';
export { CreativeAgent } from './creative.agent';
export { ComplianceAgent } from './compliance.agent';
export { EvaluatorAgent } from './evaluator.agent';
export { ExperimentAgent } from './experiment.agent';
export { MemoryAgent } from './memory.agent';

import { CEOAgent } from './ceo.agent';
import { TrendAgent } from './trend.agent';
import { ProductResearchAgent } from './product-research.agent';
import { ProductScoringAgent } from './product-scoring.agent';
import { FinanceAgent } from './finance.agent';
import { ContentAgent } from './content.agent';
import { CreativeAgent } from './creative.agent';
import { ComplianceAgent } from './compliance.agent';
import { EvaluatorAgent } from './evaluator.agent';
import { ExperimentAgent } from './experiment.agent';
import { MemoryAgent } from './memory.agent';

export type AgentRun = {
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

export class AgentOrchestrator {
  private agents = {
    ceo: new CEOAgent(),
    trend: new TrendAgent(),
    productResearch: new ProductResearchAgent(),
    productScoring: new ProductScoringAgent(),
    finance: new FinanceAgent(),
    content: new ContentAgent(),
    creative: new CreativeAgent(),
    compliance: new ComplianceAgent(),
    evaluator: new EvaluatorAgent(),
    experiment: new ExperimentAgent(),
    memory: new MemoryAgent(),
  };

  private agentRuns: AgentRun[] = [];

  /**
   * Execute an agent by name with input data
   */
  async execute(agentName: string, inputData: any): Promise<any> {
    const agent = this.agents[agentName as keyof typeof this.agents];
    if (!agent) {
      throw new Error(`Unknown agent: ${agentName}`);
    }

    const run: AgentRun = {
      agent_name: agentName,
      status: 'started',
      input_data: inputData,
      output_data: null,
      started_at: new Date().toISOString(),
    };

    this.agentRuns.push(run);

    try {
      // Call the agent's research/analyze method
      let output: any;
      const agentInstance = agent as any;

      if (typeof agentInstance.research === 'function') {
        output = await agentInstance.research(inputData);
      } else if (typeof agentInstance.analyze === 'function') {
        output = await agentInstance.analyze(inputData);
      } else if (typeof agentInstance.calculate === 'function') {
        output = await agentInstance.calculate(inputData);
      } else if (typeof agentInstance.score === 'function') {
        output = await agentInstance.score(inputData);
      } else if (typeof agentInstance.check === 'function') {
        output = await agentInstance.check(inputData);
      } else if (typeof agentInstance.generateIdeas === 'function') {
        output = await agentInstance.generateIdeas(inputData);
      } else if (typeof agentInstance.generateBrief === 'function') {
        output = await agentInstance.generateBrief(inputData);
      } else if (typeof agentInstance.generateAsset === 'function') {
        output = await agentInstance.generateAsset(inputData);
      } else if (typeof agentInstance.create === 'function') {
        output = await agentInstance.create(inputData);
      } else if (typeof agentInstance.interpret === 'function') {
        output = await agentInstance.interpret(inputData);
      } else if (typeof agentInstance.store === 'function') {
        output = await agentInstance.store(inputData);
      } else {
        output = await agentInstance.execute?.(inputData) || {};
      }

      run.status = 'completed';
      run.output_data = output;
      run.completed_at = new Date().toISOString();
      run.duration_ms = Date.now() - new Date(run.started_at).getTime();

      return output;
    } catch (error: any) {
      run.status = 'failed';
      run.error_message = error.message;
      run.completed_at = new Date().toISOString();
      throw error;
    }
  }

  /**
   * Get all agent runs
   */
  getAgentRuns(): AgentRun[] {
    return this.agentRuns;
  }

  /**
   * Get agent by name
   */
  getAgent(name: string) {
    return this.agents[name as keyof typeof this.agents];
  }

  /**
   * Get all agent system prompts
   */
  getAllSystemPrompts(): Record<string, string> {
    const prompts: Record<string, string> = {};
    for (const [name, agent] of Object.entries(this.agents)) {
      const agentInstance = agent as any;
      if (typeof agentInstance.getSystemPrompt === 'function') {
        prompts[name] = agentInstance.getSystemPrompt();
      }
    }
    return prompts;
  }
}

const defaultOrchestrator = new AgentOrchestrator();
export default defaultOrchestrator;

export function getAgent(name: string) {
  return defaultOrchestrator.getAgent(name);
}