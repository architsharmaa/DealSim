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
  id: string;
  _id?: string;
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
  _id?: string;
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
  _id?: string;
  sessionId: string;
  sender: 'user' | 'ai';
  content: string;
  timestamp: string;
}

export interface Evaluation {
  id: string;
  _id?: string;
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
