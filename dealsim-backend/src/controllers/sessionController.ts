import type { Response, NextFunction } from 'express';
import type { AuthRequest } from '../types/index.js';
import Session from '../models/Session.js';
import Simulation from '../models/Simulation.js';
import Persona from '../models/Persona.js';
import Context from '../models/Context.js';
import Rubric from '../models/Rubric.js';
import Assignment from '../models/Assignment.js';
import axios from 'axios';
import * as AnalyticsEngine from '../services/analyticsEngine.js';

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:3001';

// Helper: format transcripts for the AI service
function formatTranscript(transcripts: any[]): string {
  return transcripts
    .map((t) => `${t.speaker === 'seller' ? 'Seller' : 'Buyer'}: ${t.content}`)
    .join('\n');
}

// POST /api/sessions — Start a new session from a Simulation Template
export const startSession = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { simulationId, assignmentId } = req.body;

    if (!simulationId) {
      return res.status(400).json({ message: 'simulationId is required' });
    }

    // 1. Check for an existing session (any status) to resume or view
    const existingSession = await Session.findOne({
      userId: req.userId as string,
      simulationId
    }).populate({
      path: 'simulationId',
      populate: [{ path: 'personaId' }, { path: 'contextId' }, { path: 'rubricId' }]
    });

    if (existingSession) {
      console.log(`[Session] Returning existing session: ${existingSession._id} (Status: ${existingSession.status})`);
      return res.json(existingSession);
    }

    // 2. Fetch the compiled simulation
    const simulation = await Simulation.findById(simulationId)
      .populate('personaId')
      .populate('contextId')
      .populate('rubricId');

    if (!simulation) {
      return res.status(404).json({ message: 'Simulation not found' });
    }

    const persona = simulation.personaId as any;
    const context = simulation.contextId as any;

    // 3. Create the session inheriting from the simulation
    const session = new Session({
      userId: req.userId,
      organizationId: req.organizationId,
      simulationId: simulation._id,
      assignmentId: assignmentId || undefined,
      status: 'active',
      transcripts: [],
      conversationState: {},
      analyticsSnapshots: [],
    });

    // Use the pre-compiled orchestrated prompt for initial greeting
    try {
      const aiResponse = await axios.post(`${AI_SERVICE_URL}/ai/generate-reply`, {
        persona: {
          name: persona.name,
          role: persona.role,
          company: persona.company,
          personalityTraits: persona.personalityTraits,
          resistanceLevel: persona.resistanceLevel,
          defaultObjections: persona.defaultObjections,
        },
        context: {
          product: context.product,
          salesStage: context.salesStage,
          dealSize: context.dealSize,
          specialConditions: context.specialConditions,
        },
        transcript: `System: ${simulation.orchestratedPrompt.systemPrompt}\nContext: ${simulation.orchestratedPrompt.contextPrompt}\nGenerate an opening statement from ${persona.name}.`,
      });

      session.transcripts.push({
        speaker: 'buyer',
        content: aiResponse.data.reply,
        timestamp: new Date(),
      });
    } catch (aiError) {
      console.error('[Session] AI greeting error:', aiError);
      session.transcripts.push({
        speaker: 'buyer',
        content: `Hello, I'm ${persona.name}, ${persona.role} at ${persona.company}. What can I help you with today?`,
        timestamp: new Date(),
      });
    }

    await session.save();

    // 4. Update Assignment status if applicable
    if (assignmentId) {
      await Assignment.findByIdAndUpdate(assignmentId, { status: 'in-progress' });
    } else {
      // Look for a pending assignment for this user/simulation if not provided
      await Assignment.findOneAndUpdate(
        { userId: req.userId as string, simulationId, status: 'pending' },
        { status: 'in-progress' }
      );
    }

    // Re-fetch populated session to ensure frontend has all data
    const fullSession = await Session.findById(session._id)
      .populate({
        path: 'simulationId',
        populate: [{ path: 'personaId' }, { path: 'contextId' }, { path: 'rubricId' }]
      });

    res.status(201).json(fullSession);
  } catch (error) {
    next(error);
  }
};

// POST /api/sessions/:sessionId/message — Send a message
export const sendMessage = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { sessionId } = req.params;
    const { message } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({ message: 'Message is required' });
    }

    const session = await Session.findById(sessionId).populate('simulationId');
    if (!session) {
      return res.status(404).json({ message: 'Session not found' });
    }

    if (session.userId.toString() !== req.userId) {
      return res.status(403).json({ message: 'Access denied' });
    }

    if (session.status !== 'active') {
      return res.status(400).json({ message: 'Session is not active' });
    }

    // Append seller message
    session.transcripts.push({
      speaker: 'seller',
      content: message,
      timestamp: new Date(),
    });

    const simulation = session.simulationId as any;
    const persona = await Persona.findById(simulation.personaId);
    const context = await Context.findById(simulation.contextId);

    if (!persona || !context) {
      return res.status(500).json({ message: 'Session configuration is corrupted' });
    }

    // Call AI service using compiled prompt components
    const aiResponse = await axios.post(`${AI_SERVICE_URL}/ai/generate-reply`, {
      persona: {
        name: persona.name,
        role: persona.role,
        company: persona.company,
        personalityTraits: persona.personalityTraits,
        resistanceLevel: persona.resistanceLevel,
        defaultObjections: persona.defaultObjections,
      },
      context: {
        product: context.product,
        salesStage: context.salesStage,
        dealSize: context.dealSize,
        specialConditions: context.specialConditions,
      },
      // Injects pre-compiled system prompts alongside transcript
      transcript: `${simulation.orchestratedPrompt.systemPrompt}\n\n${formatTranscript(session.transcripts)}`,
    });

    const aiReply = aiResponse.data.reply;

    session.transcripts.push({
      speaker: 'buyer',
      content: aiReply,
      timestamp: new Date(),
    });

    // 4. Real-time Analytics Snapshot
    let buyerSentiment: 'positive' | 'neutral' | 'negative' = 'neutral';
    try {
      const sentimentResponse = await axios.post(`${AI_SERVICE_URL}/ai/analyze-sentiment`, { text: aiReply });
      const rawSentiment = sentimentResponse.data.sentiment.toLowerCase();
      if (rawSentiment.includes('positive')) buyerSentiment = 'positive';
      else if (rawSentiment.includes('negative')) buyerSentiment = 'negative';
    } catch (sentError) {
      console.error('[Session] Sentiment analysis error:', sentError);
    }

    const snapshot = {
      timestamp: new Date(),
      wpm: AnalyticsEngine.calculateWordsPerMinute(session.transcripts, session.startedAt),
      fillerWords: AnalyticsEngine.detectFillerWords(message),
      talkRatio: AnalyticsEngine.calculateTalkRatio(session.transcripts),
      monologueFlag: AnalyticsEngine.detectMonologue(message),
      buyerSentiment
    };

    session.analyticsSnapshots.push(snapshot);
    session.markModified('analyticsSnapshots');
    await session.save();

    // Re-fetch populated session to ensure frontend has all data
    const fullSession = await Session.findById(session._id)
      .populate({
        path: 'simulationId',
        populate: [{ path: 'personaId' }, { path: 'contextId' }, { path: 'rubricId' }]
      });

    res.json(fullSession);
  } catch (error) {
    next(error);
  }
};

// POST /api/sessions/:sessionId/end — End a session
export const endSession = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { sessionId } = req.params;

    const session = await Session.findById(sessionId).populate('simulationId');
    if (!session) {
      return res.status(404).json({ message: 'Session not found' });
    }

    if (session.userId.toString() !== req.userId) {
      return res.status(403).json({ message: 'Access denied' });
    }

    if (session.status !== 'active') {
      return res.status(400).json({ message: 'Session is already ended' });
    }

    const transcript = formatTranscript(session.transcripts);
    const simulation = session.simulationId as any;
    const rubric = await Rubric.findById(simulation.rubricId);

    // Use Compiled Evaluation Instructions
    const [summaryRes, evaluationRes] = await Promise.allSettled([
      axios.post(`${AI_SERVICE_URL}/ai/summarize-session`, { transcript }),
      axios.post(`${AI_SERVICE_URL}/ai/evaluate-session`, {
        transcript,
        rubric: rubric ? { 
          name: rubric.name, 
          competencies: rubric.competencies,
          instructions: simulation.orchestratedPrompt.evaluationInstructions 
        } : null,
      }),
    ]);

    if (summaryRes.status === 'fulfilled') {
      session.summary = summaryRes.value.data;
    } else {
      session.summary = { overallSummary: 'Summary failed', keyEvents: [] };
    }

    if (evaluationRes.status === 'fulfilled') {
      session.evaluation = evaluationRes.value.data;
    } else {
      session.evaluation = { competencyScores: {}, overallScore: 0, feedback: { strengths: [], weaknesses: [], recommendations: [] } };
    }

    session.status = 'evaluated';
    session.endedAt = new Date();
    await session.save();

    // 4. Update Assignment status if linked
    if (session.assignmentId) {
      await Assignment.findByIdAndUpdate(session.assignmentId, { status: 'completed' });
    } else {
      // Fallback: look for an in-progress assignment for this user/simulation
      await Assignment.findOneAndUpdate(
        { userId: req.userId as string, simulationId: session.simulationId, status: 'in-progress' },
        { status: 'completed' }
      );
    }

    // Re-fetch populated session to ensure frontend has all data
    const fullSession = await Session.findById(session._id)
      .populate({
        path: 'simulationId',
        populate: [{ path: 'personaId' }, { path: 'contextId' }, { path: 'rubricId' }]
      });

    res.json(fullSession);
  } catch (error) {
    next(error);
  }
};

// ... (other endpoints same but using simulationId)
export const getSession = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const session = await Session.findById(req.params.sessionId)
      .populate({
        path: 'simulationId',
        populate: [{ path: 'personaId' }, { path: 'contextId' }, { path: 'rubricId' }]
      });
    if (!session || session.userId.toString() !== req.userId) {
      return res.status(404).json({ message: 'Session not found' });
    }
    res.json(session);
  } catch (error) {
    next(error);
  }
};

export const getUserSessions = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const sessions = await Session.find({ userId: req.userId } as any)
      .populate({
        path: 'simulationId',
        select: 'name personaId contextId',
        populate: [{ path: 'personaId', select: 'name' }, { path: 'contextId', select: 'product' }]
      })
      .sort({ startedAt: -1 });
    res.json(sessions);
  } catch (error) {
    next(error);
  }
};
