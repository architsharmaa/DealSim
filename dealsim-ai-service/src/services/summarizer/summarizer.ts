import { LlmGateway } from '../llmGateway/llmGateway.js';
import { PromptBuilder } from '../promptBuilder/promptBuilder.js';
import { JsonExtractor } from '../../utils/jsonExtractor.js';

export class Summarizer {
  static async generateSessionSummary(transcript: string) {
    const prompt = PromptBuilder.buildSummaryPrompt(transcript);
    const result = await LlmGateway.generateSummary(prompt);
    try {
      return JsonExtractor.extractAndParse(result);
    } catch (e: any) {
      console.warn('[Summarizer] Parsing failed, falling back to raw summary:', e.message);
      return { overallSummary: result, keyEvents: [] };
    }
  }
}
