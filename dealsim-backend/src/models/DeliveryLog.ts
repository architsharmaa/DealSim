import mongoose from 'mongoose';

export interface IDeliveryLog extends mongoose.Document {
  webhookId: mongoose.Types.ObjectId;
  eventType: string;
  payload: any;
  status: 'success' | 'failed';
  statusCode?: number;
  attempt: number;
  timestamp: Date;
  error?: string;
}

const DeliveryLogSchema = new mongoose.Schema({
  webhookId: { type: mongoose.Schema.Types.ObjectId, ref: 'Webhook', required: true },
  eventType: { type: String, required: true },
  payload: { type: mongoose.Schema.Types.Mixed, required: true },
  status: { type: String, enum: ['success', 'failed'], required: true },
  statusCode: { type: Number },
  attempt: { type: Number, default: 1 },
  timestamp: { type: Date, default: Date.now },
  error: { type: String }
});

const DeliveryLog = mongoose.model<IDeliveryLog>('DeliveryLog', DeliveryLogSchema);
export default DeliveryLog;
