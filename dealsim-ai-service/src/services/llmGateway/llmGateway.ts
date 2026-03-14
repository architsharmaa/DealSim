import { openai, MODELS } from '../../config/vertex.js';

const TIMEOUT_MS = 8000;
const MAX_ATTEMPTS = 2;

async function withRetry<T>(fn: () => Promise<T>, attempts: number = MAX_ATTEMPTS): Promise<T> {
  let lastError: any;
  for (let i = 0; i < attempts; i++) {
    try {
      // Promise.race for timeout
      return await Promise.race([
        fn(),
        new Promise<T>((_, reject) => 
          setTimeout(() => reject(new Error('LLM_TIMEOUT')), TIMEOUT_MS)
        )
      ]);
    } catch (error: any) {
      lastError = error;
      if (i < attempts - 1) {
        const delay = Math.pow(2, i) * 1000;
        console.warn(`[LlmGateway] Attempt ${i + 1} failed, retrying in ${delay}ms...`, error.message);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  throw lastError;
}

export class LlmGateway {
  static async generateConversationResponse(prompt: string): Promise<string> {
    try {
      return await withRetry(async () => {
        const completion = await openai.chat.completions.create({
          model: MODELS.CONVERSATION,
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.7,
          max_tokens: 1024,
        });
        return completion.choices[0]?.message?.content || '';
      });
    } catch (error) {
      console.error('[LlmGateway Conversation Max Retries Reached]:', error);
      return "I'm sorry, I didn't fully catch that. Could you rephrase your last point?";
    }
  }

  static async generateSummary(prompt: string): Promise<string> {
    try {
      return await withRetry(async () => {
        const completion = await openai.chat.completions.create({
          model: MODELS.CONVERSATION,
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.5,
          max_tokens: 1024,
        });
        return completion.choices[0]?.message?.content || '';
      });
    } catch (error) {
      console.error('[LlmGateway Summary Error]:', error);
      throw error;
    }
  }

  static async generateEvaluation(prompt: string): Promise<string> {
    try {
      return await withRetry(async () => {
        const completion = await openai.chat.completions.create({
          model: MODELS.EVALUATION,
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.3,
          max_tokens: 2048,
        });
        return completion.choices[0]?.message?.content || '';
      });
    } catch (error) {
      console.error('[LlmGateway Evaluation Error]:', error);
      throw error;
    }
  }

  static async generateText(prompt: string): Promise<string> {
    try {
      return await withRetry(async () => {
        const completion = await openai.chat.completions.create({
          model: MODELS.EVALUATION,
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.0,
          max_tokens: 50,
        });
        return completion.choices[0]?.message?.content || '';
      });
    } catch (error) {
      console.error('[LlmGateway generateText Error]:', error);
      throw error;
    }
  }
}
