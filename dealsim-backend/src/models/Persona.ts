import mongoose from 'mongoose';

export interface IPersona extends mongoose.Document {
  name: string;
  role: string;
  company: string;
  personalityTraits: string[];
  resistanceLevel: 'low' | 'medium' | 'high';
  defaultObjections: string[];
  organizationId: mongoose.Types.ObjectId;
  createdAt: Date;
}

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

const Persona = mongoose.model<IPersona>('Persona', PersonaSchema);
export default Persona;
