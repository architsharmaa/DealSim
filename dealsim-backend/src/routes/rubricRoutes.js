import express from 'express';
import { createRubric, getRubrics } from '../controllers/rubricController.js';
import { authMiddleware, adminOnly } from '../middleware/authMiddleware.js';
const router = express.Router();
router.get('/', authMiddleware, getRubrics);
router.post('/', authMiddleware, adminOnly, createRubric);
export default router;
//# sourceMappingURL=rubricRoutes.js.map