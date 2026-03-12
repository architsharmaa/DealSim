import type { Response, NextFunction } from 'express';
import type { AuthRequest } from '../middleware/authMiddleware.js';
import Context from '../models/Context.js';

export const createContext = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const context = new Context({
      ...req.body,
      organizationId: req.organizationId
    });
    await context.save();
    res.status(201).json(context);
  } catch (error) {
    next(error);
  }
};

export const getContexts = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.organizationId) {
      return res.status(401).json({ message: 'Organization ID not found in token' });
    }
    const contexts = await Context.find({ organizationId: req.organizationId });
    res.json(contexts);
  } catch (error) {
    next(error);
  }
};
