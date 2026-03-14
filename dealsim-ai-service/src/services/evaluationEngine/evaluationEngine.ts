import { LlmGateway } from '../llmGateway/llmGateway.js';
import { PromptBuilder } from '../promptBuilder/promptBuilder.js';
import { JsonExtractor } from '../../utils/jsonExtractor.js';

interface SentimentCacheEntry {
  sentiment: string;
  expiry: number;
}

const sentimentCache = new Map<string, SentimentCacheEntry>();
const CACHE_TTL_MS = 2 * 60 * 60 * 1000; // 2 hours

export class EvaluationEngine {
  static async evaluateSession(transcript: string, rubric: any) {
    const prompt = PromptBuilder.buildEvaluationPrompt(transcript, rubric);
    const result = await LlmGateway.generateEvaluation(prompt);
    try {
      return JsonExtractor.extractAndParse(result);
    } catch (e) {
      console.error('[Evaluation Parse Error]:', e, result);
      throw new Error('Failed to parse AI evaluation results');
    }
  }

  static async analyzeSentiment(text: string, transcript: string = ''): Promise<string> {
    const cacheKey = Buffer.from(text + transcript).toString('base64');
    const cached = sentimentCache.get(cacheKey);
    
    if (cached && cached.expiry > Date.now()) {
      console.log('[EvaluationEngine] Reusing cached sentiment for text+context');
      return cached.sentiment;
    }

    const prompt = PromptBuilder.buildSentimentPrompt(text, transcript);
    const result = await LlmGateway.generateText(prompt);
    const sentiment = result.trim();
    
    sentimentCache.set(cacheKey, {
      sentiment,
      expiry: Date.now() + CACHE_TTL_MS
    });
    
    return sentiment;
  }
}
