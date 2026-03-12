import mongoose from 'mongoose';
const PersonaSchema = new mongoose.Schema({
    name: { type: String, required: true },
    role: { type: String, required: true },
    company: { type: String, required: true },
    personalityTraits: [{ type: String }],
    resistanceLevel: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
    defaultObjections: [{ type: String }],
    organizationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', required: true },
    createdAt: { type: Date, default: Date.now },
});
const Persona = mongoose.model('Persona', PersonaSchema);
export default Persona;
//# sourceMappingURL=Persona.js.map