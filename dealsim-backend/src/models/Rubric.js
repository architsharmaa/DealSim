import mongoose from 'mongoose';
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
const Rubric = mongoose.model('Rubric', RubricSchema);
export default Rubric;
//# sourceMappingURL=Rubric.js.map