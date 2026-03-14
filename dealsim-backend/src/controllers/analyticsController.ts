import type { Request, Response, NextFunction } from 'express';
import type { AuthRequest } from '../types/index.js';
import Assignment from '../models/Assignment.js';
import Session from '../models/Session.js';
import Simulation from '../models/Simulation.js';
import User from '../models/User.js';
import mongoose from 'mongoose';

export const getDashboardStats = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.userId || !req.organizationId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    const userId = new mongoose.Types.ObjectId(req.userId);
    const orgId = new mongoose.Types.ObjectId(req.organizationId);

    // 1. Avg Score from current period vs previous
    const now = new Date();
    const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);

    const currentStats = await Session.aggregate([
      { $match: { userId, status: 'evaluated', startedAt: { $gte: currentMonthStart } } },
      { $group: { _id: null, avgScore: { $avg: { $arrayElemAt: ['$evaluations.overallScore', 0] } } } }
    ]);

    const lastMonthStats = await Session.aggregate([
      { $match: { userId, status: 'evaluated', startedAt: { $gte: lastMonthStart, $lt: currentMonthStart } } },
      { $group: { _id: null, avgScore: { $avg: { $arrayElemAt: ['$evaluations.overallScore', 0] } } } }
    ]);

    const allTimeStats = await Session.aggregate([
      { $match: { userId, status: 'evaluated' } },
      { $group: { _id: null, avgScore: { $avg: { $arrayElemAt: ['$evaluations.overallScore', 0] } } } }
    ]);

    const avgScore = allTimeStats.length > 0 ? Math.round(allTimeStats[0].avgScore) : 0;
    const currentAvg = currentStats.length > 0 ? currentStats[0].avgScore : 0;
    const lastAvg = lastMonthStats.length > 0 ? lastMonthStats[0].avgScore : 0;
    
    // Variance calculation
    const scoreVariance = lastAvg > 0 ? (((currentAvg - lastAvg) / lastAvg) * 100).toFixed(1) : "0.0";
    const lastMonthAvgDisplay = lastAvg > 0 ? Math.round(lastAvg) : 0;

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

    // 4. Skill Growth: Compare first 3 vs latest 3
    const allEvaluated = await Session.find({ userId, status: 'evaluated' })
      .sort({ startedAt: 1 })
      .select('evaluations.overallScore');

    let skillGrowth = 0;
    if (allEvaluated.length >= 2) {
      const firstFew = allEvaluated.slice(0, Math.min(3, Math.floor(allEvaluated.length / 2)));
      const lastFew = allEvaluated.slice(-Math.min(3, Math.floor(allEvaluated.length / 2)));
      
      const firstAvg = firstFew.reduce((acc, s) => acc + (s.evaluations?.[0]?.overallScore || 0), 0) / firstFew.length;
      const recentAvg = lastFew.reduce((acc, s) => acc + (s.evaluations?.[0]?.overallScore || 0), 0) / lastFew.length;
      
      skillGrowth = firstAvg > 0 ? Math.round(((recentAvg - firstAvg) / firstAvg) * 100) : 0;
    }

    // 5. Assigned Simulations
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

    res.json({
      avgScore,
      scoreVariance,
      lastMonthAvgDisplay,
      sessionsCompleted,
      skillGrowth,
      recentSessions,
      assignedSimulations
    });
  } catch (error) {
    next(error);
  }
};

export const getTeamPerformance = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.organizationId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    const orgId = new mongoose.Types.ObjectId(req.organizationId);

    // 1. Organization-wide stats
    const orgStats = await Session.aggregate([
      { $match: { organizationId: orgId, status: 'evaluated' } },
      { $group: { 
          _id: null, 
          avgScore: { $avg: { $arrayElemAt: ['$evaluations.overallScore', 0] } },
          totalCompletions: { $sum: 1 }
      }}
    ]);

    const teamAvgScore = orgStats.length > 0 ? Math.round(orgStats[0].avgScore) : 0;
    const totalCompletions = orgStats.length > 0 ? orgStats[0].totalCompletions : 0;

    // 2. Fetch all employees in org
    const employees = await User.find({ organizationId: orgId, role: { $ne: 'organization_admin' } })
      .select('name email role avatarUrl')
      .lean();

    // 3. Aggregate performance for each employee
    const employeePerformance = await Promise.all(employees.map(async (emp) => {
      const empSessions = await Session.find({ userId: emp._id, status: 'evaluated' })
        .sort({ startedAt: 1 })
        .select('evaluations.overallScore');

      let avgScore = 0;
      let growth = 0;
      if (empSessions.length > 0) {
        avgScore = Math.round(empSessions.reduce((acc, s) => acc + (s.evaluations?.[0]?.overallScore || 0), 0) / empSessions.length);
        
        if (empSessions.length >= 2) {
          const first = empSessions[0]?.evaluations?.[0]?.overallScore ?? 0;
          const last = empSessions[empSessions.length - 1]?.evaluations?.[0]?.overallScore ?? 0;
          growth = first > 0 ? Math.round(((last - first) / first) * 100) : 0;
        }
      }

      return {
        _id: emp._id,
        name: emp.name,
        email: emp.email,
        role: emp.role,
        avatarUrl: (emp as any).avatarUrl,
        avgScore,
        sessionsCompleted: empSessions.length,
        skillGrowth: growth
      };
    }));

    res.json({
      teamAvgScore,
      totalCompletions,
      employeePerformance: employeePerformance.sort((a, b) => b.avgScore - a.avgScore)
    });
  } catch (error) {
    next(error);
  }
};
