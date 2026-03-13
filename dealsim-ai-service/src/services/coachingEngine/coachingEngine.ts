import { LlmGateway } from '../llmGateway/llmGateway.js';
import { PromptBuilder } from '../promptBuilder/promptBuilder.js';
import { JsonExtractor } from '../../utils/jsonExtractor.js';

export class CoachingEngine {
  static async generateCoachingInsights(transcript: string, evaluation: any, summary: any) {
    const prompt = PromptBuilder.buildCoachingPrompt(transcript, evaluation, summary);
    const result = await LlmGateway.generateEvaluation(prompt); // Using evaluation model (GPT-4) for deeper coaching
    try {
      return JsonExtractor.extractAndParse(result);
    } catch (e) {
      console.error('[Coaching Insights Parse Error]:', e, result);
      return {
        missedDiscoveryQuestions: [],
        objectionHandling: ["Failed to generate deep insights. Review transcript manually."],
        suggestedQuestions: [],
        conversationStrengths: [],
        dealRiskScore: 0.5,
        dealRiskReason: "AI parsing error during insights generation."
      };
    }
  }
}
