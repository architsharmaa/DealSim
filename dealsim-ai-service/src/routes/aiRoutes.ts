import express from 'express';
import { generateReply, summarizeSession, evaluateSession, analyzeSentiment, generateCoachingInsights, generateCloserStrategy } from '../controllers/aiController.js';

const router = express.Router();

router.post('/generate-reply', generateReply as any);
router.post('/summarize-session', summarizeSession as any);
router.post('/evaluate-session', evaluateSession as any);
router.post('/analyze-sentiment', analyzeSentiment as any);
router.post('/generate-coaching-insights', generateCoachingInsights as any);
router.post('/generate-closer-strategy', generateCloserStrategy as any);

export default router;
