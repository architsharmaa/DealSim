import { LlmGateway } from '../llmGateway/llmGateway.js';
import { PromptBuilder } from '../promptBuilder/promptBuilder.js';

export class ConversationEngine {
  static async generateBuyerReply(persona: any, context: any, transcript: string) {
    const prompt = PromptBuilder.buildConversationPrompt(persona, context, transcript);
    return await LlmGateway.generateConversationResponse(prompt);
  }
}
