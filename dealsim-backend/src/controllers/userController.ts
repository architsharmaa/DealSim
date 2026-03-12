import type { Request, Response } from 'express';
import User from '../models/User.js';

interface AuthRequest extends Request {
  userId?: string;
}

export const getMe = async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findById(req.userId).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({
      id: user._id,
      fullName: user.name,
      email: user.email,
      role: user.role,
      organizationId: user.organizationId
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
