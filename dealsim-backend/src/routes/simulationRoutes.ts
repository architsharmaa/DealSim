import express from 'express';
import { authMiddleware, adminOnly } from '../middleware/authMiddleware.js';
import {
  createSimulation,
  getSimulations,
  getSimulation
} from '../controllers/simulationController.js';

import { validate } from '../middleware/validate.js';
import { simulationSchema } from '../schemas/validationSchemas.js';

const router = express.Router();

// All routes require authentication
router.use(authMiddleware as any);

router.post('/', adminOnly as any, validate(simulationSchema), createSimulation as any);
router.get('/', getSimulations as any);
router.get('/:id', getSimulation as any);

export default router;
