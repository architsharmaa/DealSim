import express from 'express';
import { authMiddleware, adminOnly } from '../middleware/authMiddleware.js';
import * as webhookController from '../controllers/webhookController.js';

const router = express.Router();

// All webhook routes require authentication and admin privileges
router.use(authMiddleware);
router.use(adminOnly);

router.post('/', webhookController.registerWebhook);
router.get('/', webhookController.getWebhooks);
router.delete('/:id', webhookController.deleteWebhook);
router.post('/:id/test', webhookController.testWebhook);
router.get('/:id/delivery-logs', webhookController.getDeliveryLogs);

export default router;
