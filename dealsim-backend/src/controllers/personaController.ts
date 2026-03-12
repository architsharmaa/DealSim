import type { Response, NextFunction } from 'express';
import type { AuthRequest } from '../middleware/authMiddleware.js';
import Persona from '../models/Persona.js';

export const createPersona = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const persona = new Persona({
      ...req.body,
      organizationId: req.organizationId
    });
    await persona.save();
    res.status(201).json(persona);
  } catch (error) {
    next(error);
  }
};

export const getPersonas = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.organizationId) {
      return res.status(401).json({ message: 'Organization ID not found in token' });
    }
    const personas = await Persona.find({ organizationId: req.organizationId });
    res.json(personas);
  } catch (error) {
    next(error);
  }
};
