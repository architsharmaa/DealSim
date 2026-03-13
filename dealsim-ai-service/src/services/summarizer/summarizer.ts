import { LlmGateway } from '../llmGateway/llmGateway.js';
import { PromptBuilder } from '../promptBuilder/promptBuilder.js';

export class Summarizer {
  static async generateSessionSummary(transcript: string) {
    const prompt = PromptBuilder.buildSummaryPrompt(transcript);
    const result = await LlmGateway.generateSummary(prompt);
    try {
      return JSON.parse(result);
    } catch (e) {
      return { overallSummary: result, keyEvents: [] };
    }
  }
}
