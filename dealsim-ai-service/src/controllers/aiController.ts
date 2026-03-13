import { Request, Response, NextFunction } from 'express';
import { ConversationEngine } from '../services/conversationEngine/conversationEngine.js';
import { Summarizer } from '../services/summarizer/summarizer.js';
import { EvaluationEngine } from '../services/evaluationEngine/evaluationEngine.js';

console.log('[AI Controller] Script loaded');

export const generateReply = async (req: Request, res: Response, next: NextFunction) => {
  console.log(`[AI Controller] generateReply called with body:`, JSON.stringify(req.body));
  try {
    const { persona, context, transcript } = req.body;
    console.log(`[AI Controller] Generating reply for persona: ${persona?.name}`);
    const reply = await ConversationEngine.generateBuyerReply(persona, context, transcript);
    console.log(`[AI Controller] Successfully generated reply`);
    res.json({ reply });
  } catch (error: any) {
    console.error(`[AI Controller] Error in generateReply:`, error);
    next(error);
  }
};

export const summarizeSession = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { transcript } = req.body;
    const summaryData = await Summarizer.generateSessionSummary(transcript);
    res.json(summaryData);
  } catch (error) {
    next(error);
  }
};

export const evaluateSession = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { transcript, rubric } = req.body;
    const evaluation = await EvaluationEngine.evaluateSession(transcript, rubric);
    res.json(evaluation);
  } catch (error) {
    next(error);
  }
};

export const analyzeSentiment = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { text } = req.body;
    const sentiment = await EvaluationEngine.analyzeSentiment(text);
    res.json({ sentiment });
  } catch (error) {
    next(error);
  }
};
