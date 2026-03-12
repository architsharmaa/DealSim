import mongoose from 'mongoose';
const ContextSchema = new mongoose.Schema({
    product: { type: String, required: true },
    dealSize: { type: String, required: true },
    salesStage: { type: String, required: true },
    specialConditions: { type: String },
    organizationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', required: true },
    createdAt: { type: Date, default: Date.now },
});
const Context = mongoose.model('Context', ContextSchema);
export default Context;
//# sourceMappingURL=Context.js.map