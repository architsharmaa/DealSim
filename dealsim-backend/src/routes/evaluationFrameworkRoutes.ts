import express from 'express';
import { authMiddleware } from '../middleware/authMiddleware.js';
import * as evaluationFrameworkController from '../controllers/evaluationFrameworkController.js';

const router = express.Router();

router.use(authMiddleware as any);

router.get('/', evaluationFrameworkController.getFrameworks as any);
router.get('/:id', evaluationFrameworkController.getFramework as any);

export default router;
