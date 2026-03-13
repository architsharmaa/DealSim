import type { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import type { AuthRequest } from '../types/index.js';

export const authMiddleware = (req: AuthRequest, res: Response, next: NextFunction) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({ message: 'No token, authorization denied' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret_key') as any;
    req.userId = decoded.userId;
    req.organizationId = decoded.organizationId;
    req.role = decoded.role;
    console.log(`[AuthMiddleware] User:${req.userId} Org:${req.organizationId} Role:${req.role}`);
    next();
  } catch (err) {
    console.error(`[AuthMiddleware] Invalid Token:`, err);
    res.status(401).json({ message: 'Token is not valid' });
  }
};

export const adminOnly = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (req.role !== 'organization_admin' && req.role !== 'admin') {
    return res.status(403).json({ message: 'Access denied. Admins only.' });
  }
  next();
};
