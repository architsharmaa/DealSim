import type { Request } from 'express';
import mongoose from 'mongoose';

export interface AuthRequest extends Request {
  userId?: string;
  organizationId?: string;
  role?: string;
}
