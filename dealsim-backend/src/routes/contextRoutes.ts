import express from 'express';
import { createContext, getContexts } from '../controllers/contextController.js';
import { authMiddleware, adminOnly } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', authMiddleware as any, getContexts as any);
router.post('/', authMiddleware as any, adminOnly as any, createContext as any);

export default router;
