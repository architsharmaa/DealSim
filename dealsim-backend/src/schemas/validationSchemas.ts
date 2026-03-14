import { z } from 'zod';

export const personaSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  role: z.string().min(2, 'Role must be at least 2 characters'),
  company: z.string().min(2, 'Company must be at least 2 characters'),
  personalityTraits: z.array(z.string()).min(1, 'At least one personality trait is required'),
  resistanceLevel: z.enum(['low', 'medium', 'high']),
  defaultObjections: z.array(z.string()).optional()
});

export const contextSchema = z.object({
  product: z.string().min(2, 'Product name is required'),
  dealSize: z.string().min(1, 'Deal size is required'),
  salesStage: z.string().min(2, 'Sales stage is required'),
  specialConditions: z.string().optional()
});

export const competencySchema = z.object({
  name: z.string().min(2, 'Competency name is required'),
  description: z.string().min(5, 'Description must be at least 5 characters'),
  weight: z.number().min(1, 'Weight must be at least 1').max(100, 'Weight cannot exceed 100'),
  scoringGuidelines: z.string().min(5, 'Scoring guidelines are required')
});

export const rubricSchema = z.object({
  name: z.string().min(2, 'Rubric name is required'),
  competencies: z.array(competencySchema)
    .min(3, 'At least 3 competencies are required for a valid rubric')
    .max(6, 'Maximum 6 competencies allowed')
    .superRefine((competencies, ctx) => {
      const totalWeight = competencies.reduce((sum, c) => sum + c.weight, 0);
      if (totalWeight !== 100) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `Total weight must sum exactly to 100. Current sum: ${totalWeight}`,
          path: []
        });
      }
    })
});

export const simulationSchema = z.object({
  name: z.string().min(2, 'Simulation name is required'),
  personaId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid Persona ID'),
  committeePersonaIds: z.array(z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid Committee Persona ID')).optional(),
  contextId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid Context ID'),
  rubricId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid Rubric ID')
});

export const sendMessageSchema = z.object({
  message: z.string().min(1, 'Message content cannot be empty').max(2000, 'Message is too long')
});
