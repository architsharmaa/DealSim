import express from 'express';
import { createRubric, getRubrics } from '../controllers/rubricController.js';
import { authMiddleware, adminOnly } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', authMiddleware as any, getRubrics as any);
router.post('/', authMiddleware as any, adminOnly as any, createRubric as any);

export default router;
