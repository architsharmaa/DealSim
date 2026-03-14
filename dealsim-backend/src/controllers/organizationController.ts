import type { Response, NextFunction } from 'express';
import type { AuthRequest } from '../types/index.js';
import Organization from '../models/Organization.js';
import crypto from 'crypto';

export const getSettings = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const organizationId = req.organizationId;
    const org = await Organization.findById(organizationId);
    
    if (!org) {
      return res.status(404).json({ message: 'Organization not found' });
    }

    res.json({
      webhookUrl: org.webhookUrl,
      webhookSecret: org.webhookSecret
    });
  } catch (error) {
    next(error);
  }
};

export const updateSettings = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const organizationId = req.organizationId;
    const { webhookUrl, webhookSecret } = req.body;

    const update: any = {
      webhookUrl
    };

    if (webhookSecret) {
      update.webhookSecret = webhookSecret;
    } else if (webhookUrl && !webhookSecret) {
      // Auto-generate secret if URL is provided but no secret exists or is provided
      const org = await Organization.findById(organizationId);
      if (!org?.webhookSecret) {
        update.webhookSecret = crypto.randomBytes(32).toString('hex');
      }
    }

    const org = await Organization.findByIdAndUpdate(
      organizationId,
      { $set: update },
      { new: true }
    );

    if (!org) {
      return res.status(404).json({ message: 'Organization not found' });
    }

    res.json({
      webhookUrl: org.webhookUrl,
      webhookSecret: org.webhookSecret
    });
  } catch (error) {
    next(error);
  }
};
