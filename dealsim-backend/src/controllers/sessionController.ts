import mongoose, { Types } from 'mongoose';
import type { Response, NextFunction } from 'express';
import type { AuthRequest } from '../types/index.js';
import Session from '../models/Session.js';
import Simulation from '../models/Simulation.js';
import Persona from '../models/Persona.js';
import Context from '../models/Context.js';
import Rubric from '../models/Rubric.js';
import Assignment from '../models/Assignment.js';
import User from '../models/User.js';
import Organization from '../models/Organization.js';
import axios from 'axios';
import * as AnalyticsEngine from '../services/analyticsEngine.js';
import * as ConversationStateEngine from '../services/conversationStateEngine.js';
import * as EventExtractionEngine from '../services/eventExtractionEngine.js';
import { WebhookDeliveryService } from '../services/webhookDeliveryService.js';
import EvaluationFramework from '../models/EvaluationFramework.js';

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
      
      // Trigger Webhook: session.started (fired even on resume to notify external listeners)
      WebhookDeliveryService.triggerEvent(req.organizationId as string, 'session.started', {
        sessionId: existingSession._id,
        userId: existingSession.userId,
        simulationId: (existingSession.simulationId as any)?._id || existingSession.simulationId,
        status: existingSession.status,
        resumed: true
      });

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
    let linkedAssignmentId = assignmentId;
    if (!linkedAssignmentId) {
      // Proactively find an open assignment for this user and simulation
      const openAssignment = await Assignment.findOne({ 
        userId: req.userId as string, 
        simulationId, 
        status: { $in: ['pending', 'in-progress'] } 
      });
      if (openAssignment) {
        linkedAssignmentId = openAssignment._id;
      }
    }

    const session = new Session({
      userId: req.userId,
      organizationId: req.organizationId,
      simulationId: simulation._id,
      assignmentId: linkedAssignmentId || undefined,
      status: 'active',
      transcripts: [],
      conversationState: {},
      analyticsSnapshots: [],
    });

    if (linkedAssignmentId) {
      await Assignment.findByIdAndUpdate(linkedAssignmentId, { status: 'in-progress' });
    }

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

    // Trigger Webhook: session.started
    WebhookDeliveryService.triggerEvent(req.organizationId as string, 'session.started', {
      sessionId: session._id,
      userId: session.userId,
      simulationId: (session.simulationId as any)?._id || session.simulationId,
      status: session.status
    });

    res.status(201).json(fullSession);
  } catch (error) {
    next(error);
  }
};

// POST /api/sessions/:sessionId/message — Send a message
export const sendMessage = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const sessionId = req.params.sessionId as string;
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
    const sellerEntry: any = {
      speaker: 'seller',
      content: message,
      timestamp: new Date(),
    };
    session.transcripts.push(sellerEntry);

    // Update state after seller message
    if (session.conversationState) {
      session.conversationState = ConversationStateEngine.updateConversationState(
        session.transcripts,
        session.conversationState,
        sellerEntry
      );
    }

    // Extract events from seller message
    const sellerEvents = EventExtractionEngine.extractEvents(sellerEntry);
    if (sellerEvents && sellerEvents.length > 0) {
      if (!session.keyEvents) session.keyEvents = [];
      session.keyEvents.push(...(sellerEvents as any[]));
    }

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
      // Limit to last 10 conversation turns for baseline token management
      transcript: `${simulation.orchestratedPrompt.systemPrompt}\n\n${formatTranscript(session.transcripts.slice(-10))}`,
    });

    const aiReply = aiResponse.data.reply;

    const buyerEntry: any = {
      speaker: 'buyer',
      content: aiReply,
      timestamp: new Date(),
    };
    session.transcripts.push(buyerEntry);

    // Update state after buyer response
    if (session.conversationState) {
      session.conversationState = ConversationStateEngine.updateConversationState(
        session.transcripts,
        session.conversationState,
        buyerEntry
      );
    }

    // Extract events from buyer response
    const buyerEvents = EventExtractionEngine.extractEvents(buyerEntry);
    if (buyerEvents && buyerEvents.length > 0) {
      if (!session.keyEvents) session.keyEvents = [];
      session.keyEvents.push(...(buyerEvents as any[]));
    }

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
    AnalyticsEngine.logAnalyticsSnapshot(sessionId as string, snapshot);
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
    const sessionId = req.params.sessionId as string;

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

    // Trigger Webhook: session.completed
    WebhookDeliveryService.triggerEvent(req.organizationId as string, 'session.completed', {
      sessionId: session._id,
      userId: session.userId,
      simulationId: (session.simulationId as any)?._id || session.simulationId,
    });

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
      session.summary = { overallSummary: 'Summary generation failed.', keyEvents: [] };
    }

    const resultEvaluation = evaluationRes.status === 'fulfilled' 
      ? evaluationRes.value.data 
      : { competencyScores: {}, overallScore: 0, feedback: { strengths: [], weaknesses: [], recommendations: [] } };

    session.evaluations = [{
      frameworkId: simulation.rubricId,
      competencyScores: resultEvaluation.competencyScores,
      overallScore: resultEvaluation.overallScore,
      feedback: resultEvaluation.feedback,
      createdAt: new Date()
    }];

    // 3. Generate Coaching Insights (Depends on Summary & Evaluation)
    try {
      const coachingRes = await axios.post(`${AI_SERVICE_URL}/ai/generate-coaching-insights`, {
        transcript,
        summary: session.summary,
        evaluation: session.evaluations[0]
      });
      session.coachingInsights = coachingRes.data;
    } catch (coachingError) {
      console.error('[Session] Coaching insights generation failed:', coachingError);
      session.coachingInsights = {
        missedDiscoveryQuestions: [],
        objectionHandling: ["Coaching insights generation failed. Review report and transcript."],
        suggestedQuestions: [],
        conversationStrengths: [],
        dealRiskScore: 0.5,
        dealRiskReason: "Coaching insights engine error."
      };
    }

    session.status = 'evaluated';
    session.endedAt = new Date();
    await session.save();

    // Trigger Webhook: evaluation.ready
    WebhookDeliveryService.triggerEvent(req.organizationId as string, 'evaluation.ready', {
      sessionId: session._id,
      userId: session.userId,
      overallScore: session.evaluations[0]?.overallScore,
      summary: session.summary?.overallSummary
    });

    // Trigger Webhook: score.threshold_breached (if score is below org's configured threshold)
    const overallScore = session.evaluations[0]?.overallScore ?? 100;
    const org = await Organization.findById(req.organizationId);
    const threshold = org?.scoreThreshold ?? 50;
    if (overallScore < threshold) {
      WebhookDeliveryService.triggerEvent(req.organizationId as string, 'score.threshold_breached', {
        sessionId: session._id,
        userId: session.userId,
        overallScore,
        threshold,
        message: `Session score ${overallScore} is below the configured threshold of ${threshold}.`
      });
    }

    // 4. Update Assignment status if linked
    if (session.assignmentId) {
      await Assignment.findByIdAndUpdate(session.assignmentId, { status: 'completed' });
    } else {
      // Fallback: look for an in-progress assignment for this user/simulation
      const assignment = await Assignment.findOneAndUpdate(
        { userId: req.userId as string, simulationId: session.simulationId, status: 'in-progress' },
        { status: 'completed' }
      );
      if (assignment) {
        session.assignmentId = assignment._id;
        await session.save();
      }
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
// POST /api/sessions/:sessionId/closer-strategy — Generate tactical closing moves
export const generateCloserStrategy = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const sessionId = req.params.sessionId as string;
    if (!Types.ObjectId.isValid(sessionId)) {
      return res.status(400).json({ message: 'Invalid session ID' });
    }
    const session = await Session.findById(sessionId);
    
    if (!session) {
      return res.status(404).json({ message: 'Session not found' });
    }

    const isAdmin = req.role === 'organization_admin' || req.role === 'admin';
    const isOwner = session.userId.toString() === req.userId;
    const sameOrg = session.organizationId.toString() === req.organizationId;

    if (!isOwner && (!isAdmin || !sameOrg)) {
      return res.status(403).json({ message: 'Access denied' });
    }

    if (!session.coachingInsights || !session.summary) {
      return res.status(400).json({ message: 'Session must be evaluated first' });
    }

    const transcript = formatTranscript(session.transcripts);
    const aiRes = await axios.post(`${AI_SERVICE_URL}/ai/generate-closer-strategy`, {
      transcript,
      insights: session.coachingInsights,
      summary: session.summary
    });

    res.json(aiRes.data);
  } catch (error) {
    next(error);
  }
};

// ... (other endpoints same but using simulationId)
export const getSession = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const sessionId = req.params.sessionId as string;
    if (!Types.ObjectId.isValid(sessionId)) {
      return res.status(400).json({ message: 'Invalid session ID' });
    }
    const session = await Session.findById(sessionId)
      .populate({
        path: 'simulationId',
        populate: [{ path: 'personaId' }, { path: 'contextId' }, { path: 'rubricId' }]
      });

    if (!session) {
      return res.status(404).json({ message: 'Session not found' });
    }

    const isAdmin = req.role === 'organization_admin' || req.role === 'admin';
    const isOwner = String(session.userId) === String(req.userId);
    
    // Check organization match: either via session metadata or owner's organization
    let sameOrg = String(session.organizationId) === String(req.organizationId);
    
    if (!isOwner && isAdmin && !sameOrg) {
      const owner = await User.findById(session.userId);
      if (owner && String(owner.organizationId) === String(req.organizationId)) {
        sameOrg = true;
      }
    }

    console.log(`[SessionAccess] Session:${session._id} User:${req.userId} Role:${req.role} isOwner:${isOwner} isAdmin:${isAdmin} sameOrg:${sameOrg}`);

    if (!isOwner && (!isAdmin || !sameOrg)) {
      return res.status(403).json({ 
        message: 'Access denied: You do not have permission to view this report.',
        debug: { isOwner, isAdmin, sameOrg, userId: req.userId, orgId: req.organizationId }
      });
    }

    res.json(session);
  } catch (error) {
    next(error);
  }
};

export const getUserSessions = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const targetUserId = req.query.userId ? (req.query.userId as string) : (req.userId as string);
    const isRequestingSelf = targetUserId === req.userId;
    const isAdmin = req.role === 'organization_admin' || req.role === 'admin';

    // Security: Only admins can view other users' sessions within the same org
    if (!isRequestingSelf) {
      if (!isAdmin) {
        return res.status(403).json({ message: 'Access denied: Only administrators can view team session history.' });
      }
      
      // Secondary check: verify target user belongs to the same organization
      const targetUser = await User.findById(targetUserId);
      if (!targetUser || targetUser.organizationId.toString() !== req.organizationId) {
        return res.status(403).json({ message: 'Access denied: User belongs to a different organization.' });
      }
    }

    const sessions = await Session.find({ userId: targetUserId } as any)
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

// POST /api/sessions/:sessionId/re-evaluate — Re-evaluate session with a specific framework
export const reEvaluateSession = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const sessionId = req.params.sessionId as string;
    const { frameworkId } = req.body;

    if (!Types.ObjectId.isValid(sessionId)) {
      return res.status(400).json({ message: 'Invalid session ID' });
    }

    if (!frameworkId || !Types.ObjectId.isValid(frameworkId)) {
      return res.status(400).json({ message: 'Valid frameworkId is required' });
    }

    const session = await Session.findById(sessionId).populate({
      path: 'simulationId',
      populate: [{ path: 'personaId' }, { path: 'contextId' }, { path: 'rubricId' }]
    });

    if (!session) return res.status(404).json({ message: 'Session not found' });

    // Find the methodology in either EvaluationFramework or Rubric
    let framework = await EvaluationFramework.findById(frameworkId);
    if (!framework) {
        // Fallback to custom Rubric model
        const rubricAsFramework = await Rubric.findById(frameworkId);
        if (rubricAsFramework) {
            framework = rubricAsFramework as any;
        }
    }

    if (!framework) return res.status(404).json({ message: 'Methodology Framework/Rubric not found' });

    // Check permissions (Admins and Managers can re-evaluate with different frameworks)
    const isAuthorized = req.role === 'organization_admin' || req.role === 'admin' || req.role === 'manager';
    const sameOrg = String(session.organizationId) === String(req.organizationId);

    if (!isAuthorized || !sameOrg) {
      return res.status(403).json({ message: 'Access denied: Only administrators and managers can re-evaluate sessions.' });
    }

    if (session.status === 'active') {
      return res.status(400).json({ message: 'Cannot re-evaluate active sessions. Please end the session first.' });
    }

    const transcript = formatTranscript(session.transcripts);

    // Build dynamic rubric from framework competencies for AI service
    const evaluationRes = await axios.post(`${AI_SERVICE_URL}/ai/evaluate-session`, {
      transcript,
      rubric: {
        name: framework.name,
        competencies: framework.competencies,
        instructions: `Evaluate this roleplay specifically using the ${framework.name} sales methodology. ${framework.description}`
      }
    });

    const newEvaluation = {
      frameworkId: framework._id,
      competencyScores: evaluationRes.data.competencyScores as Record<string, number>,
      overallScore: evaluationRes.data.overallScore,
      feedback: evaluationRes.data.feedback,
      createdAt: new Date()
    };

    // Initialize evaluations array if missing
    if (!session.evaluations) {
      session.evaluations = [];
    }

    // Update or Push
    const existingIndex = session.evaluations.findIndex(e => e.frameworkId.toString() === frameworkId);
    if (existingIndex > -1) {
      session.evaluations[existingIndex] = newEvaluation;
    } else {
      session.evaluations.push(newEvaluation);
    }

    await session.save();

    res.json(session);
  } catch (error) {
    next(error);
  }
};
