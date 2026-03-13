import express from 'express';
import { authMiddleware } from '../middleware/authMiddleware.js';
import * as analyticsController from '../controllers/analyticsController.js';

const router = express.Router();

router.get('/dashboard-stats', authMiddleware, analyticsController.getDashboardStats);

export default router;
