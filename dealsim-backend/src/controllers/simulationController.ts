import type { Response, NextFunction } from 'express';
import type { AuthRequest } from '../types/index.js';
import Simulation from '../models/Simulation.js';
import Persona from '../models/Persona.js';
import Context from '../models/Context.js';
import Rubric from '../models/Rubric.js';

// Simulation "Compiler" Logic — mimics the Prompt Registry from the design doc
function compilePrompts(persona: any, context: any, rubric: any) {
  const systemPrompt = `You are an AI Roleplay Engine for DealSim. Your goal is to simulate a realistic buyer persona based on the provided context and traits.`;
  
  const personaPrompt = `
# BUYER PERSONA
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
    const { name, personaId, contextId, rubricId } = req.body;

    if (!name || !personaId || !contextId || !rubricId) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const [persona, context, rubric] = await Promise.all([
      Persona.findById(personaId),
      Context.findById(contextId),
      Rubric.findById(rubricId),
    ]);

    if (!persona || !context || !rubric) {
      return res.status(404).json({ message: 'One or more building blocks not found' });
    }

    // "Compile" the simulation by generating the orchestrated prompt
    const orchestratedPrompt = compilePrompts(persona, context, rubric);

    const simulation = new Simulation({
      organizationId: req.organizationId,
      name,
      personaId,
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
