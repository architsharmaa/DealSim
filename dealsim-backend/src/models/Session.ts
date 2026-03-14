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
  conversationState: {
    claimsMade: Array<{ text: string, timestamp: Date }>;
    topicsCovered: Array<{ text: string, timestamp: Date }>;
    objectionsRaised: Array<{ text: string, timestamp: Date }>;
    objectionsResolved: Array<{ text: string, timestamp: Date }>;
  };
  analyticsSnapshots: any[];
  summary: {
    overallSummary: string;
    keyEvents: string[];
  } | null;
  evaluations: Array<{
    frameworkId: mongoose.Types.ObjectId;
    competencyScores: Record<string, number>;
    overallScore: number;
    feedback: {
      strengths: string[];
      weaknesses: string[];
      recommendations: string[];
    };
    createdAt: Date;
  }>;
  coachingInsights: {
    missedDiscoveryQuestions: string[];
    objectionHandling: string[];
    suggestedQuestions: string[];
    conversationStrengths: string[];
    dealRiskScore: number;
    dealRiskReason: string;
  } | null;
  keyEvents: Array<{
    type: 'discovery_question' | 'objection_raised' | 'value_proposition' | 'pricing_discussion' | 'closing_attempt';
    message: string;
    speaker: string;
    timestamp: Date;
  }>;
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
  conversationState: {
    claimsMade: [{ text: String, timestamp: { type: Date, default: Date.now } }],
    topicsCovered: [{ text: String, timestamp: { type: Date, default: Date.now } }],
    objectionsRaised: [{ text: String, timestamp: { type: Date, default: Date.now } }],
    objectionsResolved: [{ text: String, timestamp: { type: Date, default: Date.now } }],
  },
  analyticsSnapshots: [{ type: mongoose.Schema.Types.Mixed, default: [] }],
  summary: { type: mongoose.Schema.Types.Mixed, default: null },
  evaluations: [{
    frameworkId: { type: mongoose.Schema.Types.ObjectId, ref: 'EvaluationFramework' },
    competencyScores: { type: mongoose.Schema.Types.Mixed },
    overallScore: { type: Number },
    feedback: { type: mongoose.Schema.Types.Mixed },
    createdAt: { type: Date, default: Date.now }
  }],
  coachingInsights: { type: mongoose.Schema.Types.Mixed, default: null },
  keyEvents: [{
    type: { type: String, required: true },
    message: { type: String, required: true },
    speaker: { type: String, required: true },
    timestamp: { type: Date, default: Date.now }
  }],
  startedAt: { type: Date, default: Date.now },
  endedAt: { type: Date, default: null },
});

const Session = mongoose.model<ISession>('Session', SessionSchema);
export default Session;
