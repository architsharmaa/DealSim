import type { Response, NextFunction } from 'express';
import type { AuthRequest } from '../types/index.js';
import Webhook from '../models/Webhook.js';
import { WebhookDeliveryService } from '../services/webhookDeliveryService.js';
import crypto from 'crypto';

export const registerWebhook = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { url, subscribedEvents, secret } = req.body;
    const organizationId = req.organizationId;

    if (!url || !organizationId) {
      return res.status(400).json({ message: 'URL and Organization ID are required' });
    }

    const webhook = await Webhook.create({
      url,
      subscribedEvents: subscribedEvents || [],
      secret: secret || crypto.randomBytes(32).toString('hex'),
      organizationId
    });

    res.status(201).json(webhook);
  } catch (error: any) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'A webhook with this URL already exists for your organization' });
    }
    next(error);
  }
};

export const getWebhooks = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const organizationId = req.organizationId;
    const webhooks = await Webhook.find({ organizationId: organizationId as any });
    res.json(webhooks);
  } catch (error) {
    next(error);
  }
};

export const deleteWebhook = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const organizationId = req.organizationId;

    const webhook = await Webhook.findOneAndDelete({ _id: id as any, organizationId: organizationId as any });
    if (!webhook) {
      return res.status(404).json({ message: 'Webhook not found' });
    }

    res.json({ message: 'Webhook deleted successfully' });
  } catch (error) {
    next(error);
  }
};

export const testWebhook = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const organizationId = req.organizationId;

    const webhook = await Webhook.findOne({ _id: id as any, organizationId: organizationId as any });
    if (!webhook) {
      return res.status(404).json({ message: 'Webhook not found' });
    }

    await WebhookDeliveryService.triggerTest(webhook);
    res.json({ message: 'Test webhook triggered' });
  } catch (error) {
    next(error);
  }
};
