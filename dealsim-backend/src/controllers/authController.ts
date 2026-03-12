import type { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Organization from '../models/Organization.js';

const generateToken = (userId: string, organizationId: string, role: string) => {
  return jwt.sign(
    { userId, organizationId, role },
    process.env.JWT_SECRET || 'secret_key',
    { expiresIn: '7d' }
  );
};

export const signup = async (req: Request, res: Response) => {
  try {
    const { organizationName, name, email, password, role } = req.body;

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Create organization
    const organization = new Organization({ name: organizationName });
    await organization.save();

    // Create user
    const user = new User({
      organizationId: organization._id,
      name,
      email,
      password,
      role
    });
    await user.save();

    const token = generateToken((user._id as any).toString(), (user.organizationId as any).toString(), user.role);

    res.status(201).json({
      token,
      user: {
        id: (user._id as any).toString(),
        fullName: user.name,
        email: user.email,
        role: user.role,
        organizationId: (user.organizationId as any).toString()
      }
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const token = generateToken((user._id as any).toString(), (user.organizationId as any).toString(), user.role);

    res.json({
      token,
      user: {
        id: user._id,
        fullName: user.name,
        email: user.email,
        role: user.role,
        organizationId: user.organizationId
      }
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
