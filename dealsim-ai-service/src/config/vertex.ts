import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config();

const apiKey = process.env.OPENAI_API_KEY || '';
if (!apiKey) {
  console.error('[OpenAI Config] ERROR: OPENAI_API_KEY is not set in .env');
} else {
  console.log('[OpenAI Config] API key loaded successfully');
}

export const openai = new OpenAI({ apiKey });

export const MODELS = {
  CONVERSATION: process.env.MODEL_CONVERSATION || 'gpt-4o-mini',
  EVALUATION: process.env.MODEL_EVALUATION || 'gpt-4o',
};

console.log(`[OpenAI Config] Models: Conversation=${MODELS.CONVERSATION}, Evaluation=${MODELS.EVALUATION}`);
