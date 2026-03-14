import mongoose from 'mongoose';

export interface IOrganization extends mongoose.Document {
  name: string;
  industry?: string;
  webhookUrl?: string;
  webhookSecret?: string;
  scoreThreshold?: number;
  createdAt: Date;
}

const OrganizationSchema = new mongoose.Schema({
  name: { type: String, required: true },
  industry: { type: String },
  webhookUrl: { type: String },
  webhookSecret: { type: String },
  scoreThreshold: { type: Number, default: 50 },
  createdAt: { type: Date, default: Date.now },
});

const Organization = mongoose.model<IOrganization>('Organization', OrganizationSchema);
export default Organization;
