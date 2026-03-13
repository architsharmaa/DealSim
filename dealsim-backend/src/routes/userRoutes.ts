import express from 'express';
import { getMe, getUsers } from '../controllers/userController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/me', authMiddleware as any, getMe);
router.get('/', authMiddleware as any, getUsers);

export default router;
