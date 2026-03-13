import mongoose from 'mongoose';

export interface ITranscriptEntry {
  speaker: 'seller' | 'buyer';
  content: string;
  timestamp: Date;
}

export interface ISession extends mongoose.Document {
  userId: mongoose.Types.ObjectId;
  organizationId: mongoose.Types.ObjectId;
  simulationId: mongoose.Types.ObjectId;
  assignmentId?: mongoose.Types.ObjectId;
  status: 'active' | 'completed' | 'evaluated' | 'abandoned';
  transcripts: ITranscriptEntry[];
  conversationState: any;
  analyticsSnapshots: any[];
  summary: {
    overallSummary: string;
    keyEvents: string[];
  } | null;
  evaluation: {
    competencyScores: Record<string, number>;
    overallScore: number;
    feedback: {
      strengths: string[];
      weaknesses: string[];
      recommendations: string[];
    };
  } | null;
  startedAt: Date;
  endedAt: Date | null;
}

const TranscriptEntrySchema = new mongoose.Schema({
  speaker: { type: String, enum: ['seller', 'buyer'], required: true },
  content: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
});

const SessionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  organizationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', required: true },
  simulationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Simulation', required: true },
  assignmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Assignment', required: false },
  status: { type: String, enum: ['active', 'completed', 'evaluated', 'abandoned'], default: 'active' },
  transcripts: [TranscriptEntrySchema],
  conversationState: { type: mongoose.Schema.Types.Mixed, default: {} },
  analyticsSnapshots: [{ type: mongoose.Schema.Types.Mixed }],
  summary: { type: mongoose.Schema.Types.Mixed, default: null },
  evaluation: { type: mongoose.Schema.Types.Mixed, default: null },
  startedAt: { type: Date, default: Date.now },
  endedAt: { type: Date, default: null },
});

const Session = mongoose.model<ISession>('Session', SessionSchema);
export default Session;
