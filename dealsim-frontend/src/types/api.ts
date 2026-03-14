export interface Organization {
  id: string;
  name: string;
  plan: 'free' | 'pro' | 'enterprise';
  webhookUrl?: string;
  webhookSecret?: string;
  createdAt: string;
}

export interface User {
  id: string;
  email: string;
  fullName: string;
  name?: string; // Backend compatibility
  avatarUrl?: string;
  role: 'organization_admin' | 'org_employee' | 'admin' | 'manager' | 'employee';
  organizationId: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface SignupPayload {
  organizationName: string;
  name: string;
  email: string;
  password: string;
  role: 'organization_admin' | 'org_employee';
}

export interface Persona {
  id: string;
  _id?: string; // For backend compatibility
  name: string;
  role: string;
  company: string;
  personalityTraits: string[];
  resistanceLevel: 'low' | 'medium' | 'high';
  defaultObjections: string[];
  createdAt: string;
}

export interface Context {
  id: string;
  _id?: string; // For backend compatibility
  product: string;
  dealSize: string;
  salesStage: string;
  specialConditions: string;
  createdAt: string;
}

export interface Competency {
  name: string;
  description: string;
  weight: number;
  scoringGuidelines: string;
}

export interface Rubric {
  id: string;
  _id?: string; // For backend compatibility
  name: string;
  competencies: Competency[];
  createdAt: string;
}

export interface Simulation {
  _id?: string;
  id?: string;
  name: string;
  personaId: string | Persona;
  contextId: string | Context;
  rubricId: string | Rubric;
  orchestratedPrompt: {
    systemPrompt: string;
    personaPrompt: string;
    contextPrompt: string;
    evaluationInstructions: string;
  };
  createdAt: string;
}

export interface Session {
  id: string;
  _id?: string;
  simulationId: string | Simulation;
  userId: string;
  status: 'active' | 'completed' | 'evaluated' | 'abandoned';
  transcripts: Message[];
  conversationState?: any;
  analyticsSnapshots?: any[];
  summary: {
    overallSummary: string;
    keyEvents: string[];
  } | null;
  evaluation: {
    competencyScores: Record<string, number>;
    overallScore: number;
    sentiment?: 'Positive' | 'Neutral' | 'Negative';
    objectionsResolved?: number;
    talkRatio?: { seller: number; buyer: number };
    feedback: {
      strengths: string[];
      weaknesses: string[];
      recommendations: string[];
    };
  } | null;
  coachingInsights?: {
    missedDiscoveryQuestions: string[];
    objectionHandling: string[];
    suggestedQuestions: string[];
    conversationStrengths: string[];
    dealRiskScore: number;
    dealRiskReason: string;
  } | null;
  keyEvents?: Array<{
    type: 'discovery_question' | 'objection_raised' | 'value_proposition' | 'pricing_discussion' | 'closing_attempt';
    message: string;
    speaker: string;
    timestamp: string | Date;
  }>;
  startedAt: string;
  endedAt?: string;
}

export interface Message {
  id?: string;
  _id?: string;
  speaker: 'seller' | 'buyer';
  content: string;
  timestamp: string | Date;
}

export interface Evaluation {
  id: string;
  _id?: string;
  sessionId: string;
  overallScore: number;
  competencyScores: Record<string, number>;
  feedback: {
    strengths: string[];
    weaknesses: string[];
    recommendations: string[];
  };
  createdAt: string;
}

export interface AnalyticsSnapshot {
  sessionId: string;
  timestamp: string;
  wpm: number;
  talkRatio: number; // sender / (sender + recipient)
  fillerWordCount: Record<string, number>;
  sentiment: 'positive' | 'neutral' | 'negative';
}

export interface Assignment {
  _id: string;
  id?: string;
  userId: string | User;
  simulationId: string | Simulation;
  organizationId: string | Organization;
  status: 'pending' | 'in-progress' | 'completed';
  assignedDate: string;
  dueDate?: string;
  completedAt?: string;
  score?: number;
  sessionId?: string;
}

export interface DashboardStats {
  avgScore: number;
  scoreVariance: string;
  lastMonthAvgDisplay: number;
  sessionsCompleted: number;
  skillGrowth: number;
  recentSessions: Session[];
  assignedSimulations: Assignment[];
}

export interface EmployeePerformance {
  _id: string;
  name: string;
  email: string;
  role: string;
  avatarUrl?: string;
  avgScore: number;
  sessionsCompleted: number;
  skillGrowth: number;
}

export interface TeamPerformance {
  teamAvgScore: number;
  totalCompletions: number;
  employeePerformance: EmployeePerformance[];
}
