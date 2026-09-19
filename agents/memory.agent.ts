/**
 * Memory Agent - Store validated learnings and historical outcomes.
 * 
 * Stores validated learnings and historical outcomes with source and confidence.
 * Avoids turning one-off observations into universal rules.
 */

export type Learning = {
  id: string;
  topic: string;
  finding: string;
  evidence_source: string;
  confidence: number; // 0-1
  sample_size: number;
  context: string;
  validated: boolean;
  created_at: string;
};

export type HistoricalOutcome = {
  id: string;
  content_item_id: string;
  metric: string;
  value: number;
  outcome: string;
  timestamp: string;
};

export type MemoryInput = {
  topic: string;
  finding: string;
  source: string;
  sample_size: number;
  context: string;
};

export type MemoryOutput = {
  learning: Learning;
  added_to_memory: boolean;
  confidence_updated: boolean;
};

export class MemoryAgent {
  private memory: Learning[] = [];
  private history: HistoricalOutcome[] = [];

  /**
   * Store a validated learning
   * Avoids turning one-off observations into universal rules
   */
  async store(input: MemoryInput): Promise<MemoryOutput> {
    // Validate: only store if sample size is meaningful
    const confidence = this.calculateConfidence(input.sample_size);

    const learning: Learning = {
      id: `mem_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      topic: input.topic,
      finding: input.finding,
      evidence_source: input.source,
      confidence,
      sample_size: input.sample_size,
      context: input.context,
      validated: input.sample_size >= 5, // Threshold for validation
      created_at: new Date().toISOString(),
    };

    // Only store if it's validated (sample size sufficient)
    const addedToMemory = learning.validated;
    if (addedToMemory) {
      this.memory.push(learning);
    }

    return {
      learning,
      added_to_memory: addedToMemory,
      confidence_updated: confidence > 0.5,
    };
  }

  /**
   * Record a historical outcome
   */
  async recordOutcome(outcome: Omit<HistoricalOutcome, 'id' | 'timestamp'>): Promise<HistoricalOutcome> {
    const record: HistoricalOutcome = {
      id: `hist_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      ...outcome,
      timestamp: new Date().toISOString(),
    };
    this.history.push(record);
    return record;
  }

  /**
   * Get learnings by topic
   */
  async getLearnings(topic?: string): Promise<Learning[]> {
    if (topic) {
      return this.memory.filter(l => l.topic.toLowerCase().includes(topic.toLowerCase()));
    }
    return this.memory;
  }

  /**
   * Get historical outcomes for a content item
   */
  async getHistory(contentItemId: string): Promise<HistoricalOutcome[]> {
    return this.history.filter(h => h.content_item_id === contentItemId);
  }

  /**
   * Calculate confidence based on sample size
   * Larger sample = higher confidence
   * Never turn one-off observations into universal rules
   */
  private calculateConfidence(sampleSize: number): number {
    if (sampleSize >= 50) return 0.95;
    if (sampleSize >= 20) return 0.8;
    if (sampleSize >= 10) return 0.65;
    if (sampleSize >= 5) return 0.5;
    if (sampleSize >= 2) return 0.3;
    return 0.1; // Single observation - very low confidence
  }
}

export default new MemoryAgent();