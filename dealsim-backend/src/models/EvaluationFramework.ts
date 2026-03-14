import mongoose from 'mongoose';

export interface IFrameworkCompetency {
  name: string;
  description: string;
  weight: number;
  scoringGuidelines: string;
}

export interface IEvaluationFramework extends mongoose.Document {
  name: string;
  description: string;
  competencies: IFrameworkCompetency[];
  isBuiltIn: boolean;
  createdAt: Date;
}

const FrameworkCompetencySchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  weight: { type: Number, required: true, min: 0, max: 100 },
  scoringGuidelines: { type: String, required: true },
});

const EvaluationFrameworkSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  description: { type: String, required: true },
  competencies: [FrameworkCompetencySchema],
  isBuiltIn: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

const EvaluationFramework = mongoose.model<IEvaluationFramework>('EvaluationFramework', EvaluationFrameworkSchema);
export default EvaluationFramework;
