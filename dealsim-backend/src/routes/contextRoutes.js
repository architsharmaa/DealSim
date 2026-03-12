import express from 'express';
import { createContext, getContexts } from '../controllers/contextController.js';
import { authMiddleware, adminOnly } from '../middleware/authMiddleware.js';
const router = express.Router();
router.get('/', authMiddleware, getContexts);
router.post('/', authMiddleware, adminOnly, createContext);
export default router;
//# sourceMappingURL=contextRoutes.js.map