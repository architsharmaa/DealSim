import type { Response, NextFunction } from 'express';
import type { AuthRequest } from '../types/index.js';
import EvaluationFramework from '../models/EvaluationFramework.js';

export const getFrameworks = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const frameworks = await EvaluationFramework.find();
    res.json(frameworks);
  } catch (error) {
    next(error);
  }
};

export const getFramework = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const framework = await EvaluationFramework.findById(req.params.id);
    if (!framework) {
      return res.status(404).json({ message: 'Framework not found' });
    }
    res.json(framework);
  } catch (error) {
    next(error);
  }
};
