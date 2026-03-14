import express from 'express';
import { authMiddleware, adminOnly } from '../middleware/authMiddleware.js';
import * as organizationController from '../controllers/organizationController.js';

const router = express.Router();

router.use(authMiddleware);
router.use(adminOnly);

router.get('/settings', organizationController.getSettings);
router.patch('/settings', organizationController.updateSettings);

export default router;
