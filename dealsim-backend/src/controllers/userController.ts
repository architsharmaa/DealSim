import type { Response } from 'express';
import User from '../models/User.js';
import type { AuthRequest } from '../types/index.js';

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

export const getUsers = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.organizationId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    const users = await User.find({ organizationId: req.organizationId as string }).select('-password');
    res.json(users.map(user => ({
      id: user._id,
      fullName: user.name,
      email: user.email,
      role: user.role,
      organizationId: user.organizationId
    })));
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
