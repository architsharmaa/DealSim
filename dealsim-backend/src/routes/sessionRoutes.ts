import express from 'express';
import { authMiddleware, adminOnly } from '../middleware/authMiddleware.js';
import {
  startSession,
  sendMessage,
  endSession,
  getSession,
  getUserSessions,
  generateCloserStrategy,
  reEvaluateSession,
} from '../controllers/sessionController.js';
import { rateLimitMiddleware } from '../middleware/rateLimitMiddleware.js';

import { validate } from '../middleware/validate.js';
import { sendMessageSchema } from '../schemas/validationSchemas.js';

const router = express.Router();

// All routes require authentication
router.use(authMiddleware as any);

router.post('/', authMiddleware as any, startSession as any);
router.get('/', getUserSessions as any);
router.get('/:sessionId', getSession as any);
router.post('/:sessionId/message', rateLimitMiddleware as any, validate(sendMessageSchema), sendMessage as any);
router.post('/:sessionId/end', endSession as any);
router.post('/:sessionId/closer-strategy', generateCloserStrategy as any);
router.post('/:sessionId/re-evaluate', reEvaluateSession as any);

export default router;
