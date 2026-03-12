import mongoose from 'mongoose';

export interface IOrganization extends mongoose.Document {
  name: string;
  industry?: string;
  createdAt: Date;
}

const OrganizationSchema = new mongoose.Schema({
  name: { type: String, required: true },
  industry: { type: String },
  createdAt: { type: Date, default: Date.now },
});

const Organization = mongoose.model<IOrganization>('Organization', OrganizationSchema);
export default Organization;
