import mongoose, { Schema, Document } from 'mongoose';

export interface IAssignment extends Document {
  userId: mongoose.Types.ObjectId;
  simulationId: mongoose.Types.ObjectId;
  organizationId: mongoose.Types.ObjectId;
  status: 'pending' | 'in-progress' | 'completed';
  assignedDate: Date;
  dueDate?: Date;
  completedAt?: Date;
  score?: number;
}

const AssignmentSchema: Schema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  simulationId: { type: Schema.Types.ObjectId, ref: 'Simulation', required: true },
  organizationId: { type: Schema.Types.ObjectId, ref: 'Organization', required: true },
  status: { 
    type: String, 
    enum: ['pending', 'in-progress', 'completed'], 
    default: 'pending' 
  },
  assignedDate: { type: Date, default: Date.now },
  dueDate: { type: Date },
  completedAt: { type: Date },
  score: { type: Number }
}, { timestamps: true });

// Ensure unique assignment per user and simulation
AssignmentSchema.index({ userId: 1, simulationId: 1 }, { unique: true });

export default mongoose.model<IAssignment>('Assignment', AssignmentSchema);
