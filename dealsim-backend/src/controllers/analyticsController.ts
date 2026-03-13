import type { Request, Response, NextFunction } from 'express';
import type { AuthRequest } from '../types/index.js';
import Assignment from '../models/Assignment.js';
import Session from '../models/Session.js';
import Simulation from '../models/Simulation.js';
import mongoose from 'mongoose';

export const getDashboardStats = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.userId || !req.organizationId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    const userId = new mongoose.Types.ObjectId(req.userId);
    const orgId = new mongoose.Types.ObjectId(req.organizationId);

    // 1. Avg Score from completed/evaluated sessions
    const scoreStats = await Session.aggregate([
      { $match: { userId, status: 'evaluated' } },
      { $group: { _id: null, avgScore: { $avg: '$evaluation.overallScore' } } }
    ]);
    const avgScore = scoreStats.length > 0 ? Math.round(scoreStats[0].avgScore) : 0;

    // 2. Sessions Completed
    const sessionsCompleted = await Session.countDocuments({ userId, status: 'evaluated' });

    // 3. Recent Activity (Latest 5 sessions)
    const recentSessions = await Session.find({ userId })
      .populate({
        path: 'simulationId',
        select: 'name personaId contextId',
        populate: [
          { path: 'personaId', select: 'name' },
          { path: 'contextId', select: 'product' }
        ]
      })
      .sort({ createdAt: -1 })
      .limit(5);

    // 4. Skill Growth (Mocking for now, could be calculated by comparing early vs late scores)
    const skillGrowth = 12; // Example static value

    // 5. Assigned Simulations (Pending or In-Progress)
    console.log(`[Analytics] Querying assignments for userId string: "${req.userId}"`);
    const assignedSimulations = await Assignment.find({ 
      userId: req.userId, 
      status: { $ne: 'completed' } 
    })
      .populate({
        path: 'simulationId',
        select: 'name personaId contextId',
        populate: [
          { path: 'personaId' },
          { path: 'contextId' }
        ]
      })
      .sort({ assignedDate: -1 })
      .limit(4);

    console.log(`[Analytics] Result for ${req.userId}: ${assignedSimulations.length} assignments found`);
    if (assignedSimulations.length === 0) {
      const allUserAssignments = await Assignment.find({ userId: req.userId });
      console.log(`[Analytics] DEBUG: Total assignments for user ${req.userId}: ${allUserAssignments.length}`);
    }

    res.json({
      avgScore,
      sessionsCompleted,
      skillGrowth,
      recentSessions,
      assignedSimulations
    });
  } catch (error) {
    next(error);
  }
};
