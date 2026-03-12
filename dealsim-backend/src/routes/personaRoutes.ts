import express from 'express';
import { createPersona, getPersonas } from '../controllers/personaController.js';
import { authMiddleware, adminOnly } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', authMiddleware as any, getPersonas as any);
router.post('/', authMiddleware as any, adminOnly as any, createPersona as any);

export default router;
