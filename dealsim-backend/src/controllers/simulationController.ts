import type { Response, NextFunction } from 'express';
import type { AuthRequest } from '../types/index.js';
import Simulation from '../models/Simulation.js';
import Persona from '../models/Persona.js';
import Context from '../models/Context.js';
import Rubric from '../models/Rubric.js';
import EvaluationFramework from '../models/EvaluationFramework.js';

// Simulation "Compiler" Logic — mimics the Prompt Registry from the design doc
function compilePrompts(persona: any, context: any, rubric: any, committeePersonas: any[] = []) {
  const isCommittee = committeePersonas.length > 0;

  const allPersonas = [persona, ...committeePersonas];
  const committeeSummary = isCommittee
    ? `\n\n# BUYING COMMITTEE\nThis is a multi-stakeholder enterprise sale. The following personas may participate:\n${allPersonas.map(p => `- ${p.name} (${p.role}): Priorities include ${(p.personalityTraits || []).join(', ')}. Objections: ${(p.defaultObjections || []).join('; ')}.`).join('\n')}\nEach stakeholder will respond when the topic is relevant to their role. Stay strictly in character for whoever is speaking.`
    : '';

  const systemPrompt = `You are an AI Roleplay Engine for DealSim. Your goal is to simulate a realistic buyer persona based on the provided context and traits.${committeeSummary}`;
  
  const personaPrompt = `
# PRIMARY BUYER PERSONA
Name: ${persona.name}
Role: ${persona.role}
Company: ${persona.company}
Personality: ${persona.personalityTraits.join(', ')}
Resistance Level: ${persona.resistanceLevel}
Default Objections: ${persona.defaultObjections.join('; ')}
`;

  const contextPrompt = `
# DEAL CONTEXT
Product: ${context.product}
Stage: ${context.salesStage}
Deal Size: ${context.dealSize}
Special Conditions: ${context.specialConditions || 'None'}
`;

  const evaluationInstructions = `
Evaluate the session based on the Rubric: ${rubric.name}.
Competencies: ${rubric.competencies.map((c: any) => `${c.name} (${c.weight}%)`).join(', ')}.
${isCommittee ? `Also evaluate: Stakeholder Handling — did the seller adapt communication per persona, address each stakeholder's concerns, and resolve conflicting priorities?` : ''}
Provide qualitative feedback and a score out of 100.
`;

  return {
    systemPrompt,
    personaPrompt,
    contextPrompt,
    evaluationInstructions
  };
}

// POST /api/simulations — Create (Compile) a simulation
export const createSimulation = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { name, personaId, contextId, rubricId, committeePersonaIds } = req.body;

    if (!name || !personaId || !contextId || !rubricId) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const [persona, context] = await Promise.all([
      Persona.findById(personaId),
      Context.findById(contextId),
    ]);

    let rubric = await Rubric.findById(rubricId);
    if (!rubric) {
      rubric = await EvaluationFramework.findById(rubricId) as any;
    }

    if (!persona || !context || !rubric) {
      return res.status(404).json({ message: 'One or more building blocks not found' });
    }

    // Fetch committee personas if provided
    let committeePersonas: any[] = [];
    const cleanCommitteeIds: string[] = [];
    if (committeePersonaIds && committeePersonaIds.length > 0) {
      committeePersonas = await Persona.find({ _id: { $in: committeePersonaIds } });
      committeePersonas.forEach(cp => cleanCommitteeIds.push(String(cp._id)));
    }

    // "Compile" the simulation by generating the orchestrated prompt
    const orchestratedPrompt = compilePrompts(persona, context, rubric, committeePersonas);

    const simulation = new Simulation({
      organizationId: req.organizationId,
      name,
      personaId,
      committeePersonaIds: cleanCommitteeIds,
      contextId,
      rubricId,
      orchestratedPrompt
    });

    await simulation.save();
    res.status(201).json(simulation);
  } catch (error) {
    next(error);
  }
};

// GET /api/simulations — List simulations
export const getSimulations = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const simulations = await Simulation.find({ organizationId: req.organizationId } as any)
      .populate('personaId', 'name role')
      .populate('contextId', 'product salesStage');
    res.json(simulations);
  } catch (error) {
    next(error);
  }
};

// GET /api/simulations/:id — Get a single simulation
export const getSimulation = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const simulation = await Simulation.findById(req.params.id)
      .populate('personaId')
      .populate('contextId')
      .populate('rubricId');
    if (!simulation) return res.status(404).json({ message: 'Simulation not found' });
    res.json(simulation);
  } catch (error) {
    next(error);
  }
};
