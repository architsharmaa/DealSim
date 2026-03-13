import express from 'express';
import { authMiddleware, adminOnly } from '../middleware/authMiddleware.js';
import {
  startSession,
  sendMessage,
  endSession,
  getSession,
  getUserSessions,
} from '../controllers/sessionController.js';

const router = express.Router();

// All routes require authentication
router.use(authMiddleware as any);

router.post('/', authMiddleware as any, startSession as any);
router.get('/', getUserSessions as any);
router.get('/:sessionId', getSession as any);
router.post('/:sessionId/message', sendMessage as any);
router.post('/:sessionId/end', endSession as any);

export default router;
