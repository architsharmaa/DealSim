import type { Response, NextFunction } from 'express';
import type { AuthRequest } from '../types/index.js';

// Simple in-memory rate limiting map
// Key: sessionId (or userId + sessionId)
// Value: { count: number, firstMsgTime: number, totalInSession: number }
const limits = new Map<string, { count: number, firstMsgTime: number, totalInSession: number }>();

const WINDOW_MS = 60 * 1000; // 1 minute
const MAX_PER_WINDOW = 20;
const MAX_PER_SESSION = 200;

export const rateLimitMiddleware = (req: AuthRequest, res: Response, next: NextFunction) => {
  const sessionId = req.params.sessionId as string;
  if (!sessionId) return next();

  const now = Date.now();
  const sessionLimit = limits.get(sessionId) || { count: 0, firstMsgTime: now, totalInSession: 0 };

  // Check total session limit
  if (sessionLimit.totalInSession >= MAX_PER_SESSION) {
    return res.status(429).json({ message: 'Session message limit reached.' });
  }

  // Check window limit
  if (now - sessionLimit.firstMsgTime > WINDOW_MS) {
    // Reset window
    sessionLimit.count = 1;
    sessionLimit.firstMsgTime = now;
  } else {
    sessionLimit.count++;
  }

  if (sessionLimit.count > MAX_PER_WINDOW) {
    return res.status(429).json({ message: 'Too many messages. Please slow down.' });
  }

  // Increment total and update map
  sessionLimit.totalInSession++;
  limits.set(sessionId, sessionLimit);

  next();
};
