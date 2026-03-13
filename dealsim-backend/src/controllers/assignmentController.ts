import type { Response, NextFunction } from 'express';
import type { AuthRequest } from '../types/index.js';
import Assignment from '../models/Assignment.js';
import User from '../models/User.js';
import Session from '../models/Session.js';

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
      .sort({ assignedDate: -1 })
      .lean();

    // Map sessions to assignments
    const assignmentsWithSessions = await Promise.all(assignments.map(async (a) => {
      // Prioritize evaluated sessions for the assignment link
      let session = await Session.findOne({ 
        assignmentId: a._id, 
        status: 'evaluated' 
      }).select('_id');
      
      // If no evaluated session found directly, look for any linked session (e.g. active)
      if (!session) {
        session = await Session.findOne({ assignmentId: a._id }).select('_id');
      }
      
      // Fallback: if no direct link, find most recent evaluated session for this user/simulation
      if (!session) {
        session = await Session.findOne({ 
          userId: a.userId?._id || a.userId, 
          simulationId: a.simulationId?._id || a.simulationId,
          status: 'evaluated'
        })
        .sort({ endedAt: -1 })
        .select('_id');
      }

      return {
        ...a,
        sessionId: session?._id || null
      };
    }));

    res.json(assignmentsWithSessions);
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
