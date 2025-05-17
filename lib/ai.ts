import { Decision } from '@/lib/types';

class AIService {
  // Generate insights for a given decision
  async generateInsights(decision: Decision): Promise<string[]> {
    try {
      // Simulate AI processing (replace with actual AI logic)
      const insights = [
        `Insight 1: The impact score of ${decision.impactScore} indicates a significant decision.`,
        `Insight 2: The category "${decision.category}" suggests focusing on related goals.`,
        `Insight 3: Consider the urgency level (${decision.urgencyLevel}) when prioritizing tasks.`,
      ];
      return insights;
    } catch (error: unknown) {
      const err = error as Error;
      throw new Error(`Failed to generate insights: ${err.message}`);
    }
  }

  // Find similar decisions based on a given decision
  async getSimilarDecisions(decision: Decision, allDecisions: Decision[]): Promise<Decision[]> {
    try {
      // Simple similarity logic based on category and impact score
      const similarDecisions = allDecisions
        .filter((d: Decision) => d.id !== decision.id) // Exclude the same decision
        .map((d: Decision) => {
          // Calculate a simple similarity score (e.g., based on category match and impact score difference)
          const categoryMatch = d.category === decision.category ? 1 : 0;
          const impactDiff = Math.abs(d.impactScore - decision.impactScore);
          const similarity = categoryMatch * 0.7 + (1 - impactDiff / 10) * 0.3; // Weighted similarity
          return { ...d, similarity };
        })
        .filter((d: Decision & { similarity: number }) => d.similarity > 0.5) // Threshold for similarity
        .sort((a: Decision & { similarity: number }, b: Decision & { similarity: number }) => b.similarity - a.similarity)
        .slice(0, 5); // Top 5 similar decisions

      return similarDecisions;
    } catch (error: unknown) {
      const err = error as Error;
      throw new Error(`Failed to find similar decisions: ${err.message}`);
    }
  }
}

export const aiService = new AIService();