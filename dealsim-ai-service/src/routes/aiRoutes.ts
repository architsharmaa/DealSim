import express from 'express';
import { generateReply, summarizeSession, evaluateSession } from '../controllers/aiController.js';

const router = express.Router();

router.post('/generate-reply', generateReply as any);
router.post('/summarize-session', summarizeSession as any);
router.post('/evaluate-session', evaluateSession as any);

export default router;
