import mongoose from 'mongoose';

export interface IContext extends mongoose.Document {
  product: string;
  dealSize: string;
  salesStage: string;
  specialConditions: string;
  organizationId: mongoose.Types.ObjectId;
  createdAt: Date;
}

const ContextSchema = new mongoose.Schema({
  product: { type: String, required: true },
  dealSize: { type: String, required: true },
  salesStage: { type: String, required: true },
  specialConditions: { type: String },
  organizationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', required: true },
  createdAt: { type: Date, default: Date.now },
});

const Context = mongoose.model<IContext>('Context', ContextSchema);
export default Context;
