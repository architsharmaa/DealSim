export interface Organization {
  id: string;
  name: string;
  plan: 'free' | 'pro' | 'enterprise';
  createdAt: string;
}

export interface User {
  id: string;
  email: string;
  fullName: string;
  avatarUrl?: string;
  role: 'admin' | 'manager' | 'employee';
  organizationId: string;
}

export interface Persona {
  id: string;
  name: string;
  role: string;
  company: string;
  avatarUrl: string;
  traits: string[];
  objective: string;
  contextPrompt: string;
  createdAt: string;
}

export interface Context {
  id: string;
  title: string;
  description: string;
  industry: string;
  scenarioType: 'negotiation' | 'pitch' | 'discovery' | 'closing';
  basePrompt: string;
  createdAt: string;
}

export interface Rubric {
  id: string;
  title: string;
  criteria: Array<{
    name: string;
    description: string;
    weight: number; // 0 to 1
  }>;
  createdAt: string;
}

export interface Simulation {
  id: string;
  title: string;
  description: string;
  personaId: string;
  contextId: string;
  rubricId: string;
  difficulty: 'easy' | 'medium' | 'hard';
  estimatedDuration: number; // in minutes
  createdAt: string;
}

export interface Session {
  id: string;
  simulationId: string;
  userId: string;
  status: 'active' | 'completed' | 'abandoned';
  startTime: string;
  endTime?: string;
  simulationTitle: string;
  personaName: string;
}

export interface Message {
  id: string;
  sessionId: string;
  sender: 'user' | 'ai';
  content: string;
  timestamp: string;
}

export interface Evaluation {
  id: string;
  sessionId: string;
  overallScore: number;
  competencyScores: Record<string, number>;
  summary: string;
  keyTakeaways: string[];
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
