import { LlmGateway } from '../llmGateway/llmGateway.js';
import { PromptBuilder } from '../promptBuilder/promptBuilder.js';

export class EvaluationEngine {
  static async evaluateSession(transcript: string, rubric: any) {
    const prompt = PromptBuilder.buildEvaluationPrompt(transcript, rubric);
    const result = await LlmGateway.generateEvaluation(prompt);
    try {
      // Clean up markdown code blocks if necessary
      const cleanedResult = result.replace(/```json\n?|\n?```/g, '').trim();
      return JSON.parse(cleanedResult);
    } catch (e) {
      console.error('[Evaluation Parse Error]:', e, result);
      throw new Error('Failed to parse AI evaluation results');
    }
  }

  static async analyzeSentiment(text: string): Promise<string> {
    const prompt = PromptBuilder.buildSentimentPrompt(text);
    const result = await LlmGateway.generateText(prompt);
    return result.trim();
  }
}
