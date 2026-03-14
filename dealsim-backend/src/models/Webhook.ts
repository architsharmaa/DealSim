import mongoose from 'mongoose';

export interface IWebhook extends mongoose.Document {
  url: string;
  subscribedEvents: string[];
  secret: string;
  organizationId: mongoose.Types.ObjectId;
  createdAt: Date;
}

const WebhookSchema = new mongoose.Schema({
  url: { type: String, required: true },
  subscribedEvents: { 
    type: [String], 
    enum: ['session.started', 'session.completed', 'evaluation.ready', 'score.threshold_breached', 'webhook.test'],
    default: []
  },
  secret: { type: String, required: true },
  organizationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', required: true },
  createdAt: { type: Date, default: Date.now }
});

// Ensure one webhook per URL per organization
WebhookSchema.index({ url: 1, organizationId: 1 }, { unique: true });

const Webhook = mongoose.model<IWebhook>('Webhook', WebhookSchema);
export default Webhook;
