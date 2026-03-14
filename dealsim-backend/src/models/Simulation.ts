import mongoose from 'mongoose';

export interface IOrchestratedPrompt {
  systemPrompt: string;
  personaPrompt: string;
  contextPrompt: string;
  evaluationInstructions: string;
}

export interface ISimulation extends mongoose.Document {
  organizationId: mongoose.Types.ObjectId;
  name: string;
  personaId: mongoose.Types.ObjectId;
  committeePersonaIds?: mongoose.Types.ObjectId[]; // Optional buying committee members
  contextId: mongoose.Types.ObjectId;
  rubricId: mongoose.Types.ObjectId;
  orchestratedPrompt: IOrchestratedPrompt;
  createdAt: Date;
}

const OrchestratedPromptSchema = new mongoose.Schema({
  systemPrompt: { type: String, required: true },
  personaPrompt: { type: String, required: true },
  contextPrompt: { type: String, required: true },
  evaluationInstructions: { type: String, required: true },
});

const SimulationSchema = new mongoose.Schema({
  organizationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', required: true },
  name: { type: String, required: true },
  personaId: { type: mongoose.Schema.Types.ObjectId, ref: 'Persona', required: true },
  committeePersonaIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Persona' }],
  contextId: { type: mongoose.Schema.Types.ObjectId, ref: 'Context', required: true },
  rubricId: { type: mongoose.Schema.Types.ObjectId, ref: 'Rubric', required: true },
  orchestratedPrompt: { type: OrchestratedPromptSchema, required: true },
  createdAt: { type: Date, default: Date.now },
});

const Simulation = mongoose.model<ISimulation>('Simulation', SimulationSchema);
export default Simulation;
