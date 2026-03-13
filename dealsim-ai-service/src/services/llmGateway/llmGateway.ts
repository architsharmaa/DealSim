import { openai, MODELS } from '../../config/vertex.js';

export class LlmGateway {
  static async generateConversationResponse(prompt: string): Promise<string> {
    try {
      const completion = await openai.chat.completions.create({
        model: MODELS.CONVERSATION,
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
        max_tokens: 1024,
      });
      const text = completion.choices[0]?.message?.content || '';
      console.log('[LlmGateway] Conversation response received, length:', text.length);
      return text;
    } catch (error) {
      console.error('[LlmGateway Conversation Error]:', error);
      throw error;
    }
  }

  static async generateSummary(prompt: string): Promise<string> {
    try {
      const completion = await openai.chat.completions.create({
        model: MODELS.CONVERSATION,
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.5,
        max_tokens: 1024,
      });
      return completion.choices[0]?.message?.content || '';
    } catch (error) {
      console.error('[LlmGateway Summary Error]:', error);
      throw error;
    }
  }

  static async generateEvaluation(prompt: string): Promise<string> {
    try {
      const completion = await openai.chat.completions.create({
        model: MODELS.EVALUATION,
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.3,
        max_tokens: 2048,
      });
      return completion.choices[0]?.message?.content || '';
    } catch (error) {
      console.error('[LlmGateway Evaluation Error]:', error);
      throw error;
    }
  }
}
