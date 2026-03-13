import express from 'express';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { adminOnly } from '../middleware/authMiddleware.js';
import * as assignmentController from '../controllers/assignmentController.js';

const router = express.Router();

// Get all assignments in organization
router.get('/', authMiddleware, assignmentController.getAssignments);

// Create assignment (Admin only)
router.post('/', authMiddleware, adminOnly, assignmentController.createAssignment);

// Delete assignment (Admin only)
router.delete('/:id', authMiddleware, adminOnly, assignmentController.deleteAssignment);

export default router;
