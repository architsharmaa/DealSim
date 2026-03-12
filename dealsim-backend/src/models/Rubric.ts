import mongoose from 'mongoose';

export interface ICompetency {
  name: string;
  description: string;
  weight: number;
  scoringGuidelines: string;
}

export interface IRubric extends mongoose.Document {
  name: string;
  competencies: ICompetency[];
  organizationId: mongoose.Types.ObjectId;
  createdAt: Date;
}

const CompetencySchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  weight: { type: Number, required: true, min: 0, max: 100 },
  scoringGuidelines: { type: String, required: true },
});

const RubricSchema = new mongoose.Schema({
  name: { type: String, required: true },
  competencies: [CompetencySchema],
  organizationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', required: true },
  createdAt: { type: Date, default: Date.now },
});

const Rubric = mongoose.model<IRubric>('Rubric', RubricSchema);
export default Rubric;
