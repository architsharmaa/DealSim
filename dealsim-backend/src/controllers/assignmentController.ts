import type { Response, NextFunction } from 'express';
import type { AuthRequest } from '../types/index.js';
import Assignment from '../models/Assignment.js';
import User from '../models/User.js';

export const createAssignment = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { userId, simulationId, dueDate } = req.body;
    console.log(`[AssignmentController] Creating assignment: User=${userId}, Sim=${simulationId}, Org=${req.organizationId}`);

    if (!req.organizationId) {
      return res.status(401).json({ message: 'Unauthorized: No organization ID' });
    }

    const assignment = new Assignment({
      userId,
      simulationId,
      organizationId: req.organizationId,
      dueDate
    });

    await assignment.save();
    console.log(`[AssignmentController] Assignment saved: ${assignment._id}`);
    res.status(201).json(assignment);
  } catch (error: any) {
    console.error(`[AssignmentController] Error creating assignment:`, error);
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Assignment already exists for this user and simulation' });
    }
    next(error);
  }
};

export const getAssignments = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.organizationId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    const assignments = await Assignment.find({ organizationId: req.organizationId as string })
      .populate({
        path: 'userId',
        select: 'name role avatar'
      })
      .populate({
        path: 'simulationId',
        select: 'name'
      })
      .sort({ assignedDate: -1 });

    res.json(assignments);
  } catch (error) {
    next(error);
  }
};

export const deleteAssignment = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id;
    if (!id || !req.organizationId) {
      return res.status(400).json({ message: 'Missing parameters' });
    }
    
    const assignment = await Assignment.findOneAndDelete({ 
      _id: id as string, 
      organizationId: req.organizationId as string 
    });
    
    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found' });
    }
    
    res.json({ message: 'Assignment deleted' });
  } catch (error) {
    next(error);
  }
};
