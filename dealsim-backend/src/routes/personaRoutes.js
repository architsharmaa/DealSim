import express from 'express';
import { createPersona, getPersonas } from '../controllers/personaController.js';
import { authMiddleware, adminOnly } from '../middleware/authMiddleware.js';
const router = express.Router();
router.get('/', authMiddleware, getPersonas);
router.post('/', authMiddleware, adminOnly, createPersona);
export default router;
//# sourceMappingURL=personaRoutes.js.map