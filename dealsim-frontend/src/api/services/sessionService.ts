import apiClient from '../client';
import type { Session, Message } from '../../types/api';

export const sessionService = {
  startSession: async (simulationId: string): Promise<Session> => {
    return apiClient.post<Session>('/sessions', { simulationId });
  },

  getSession: async (id: string): Promise<Session> => {
    return apiClient.get<Session>(`/sessions/${id}`);
  },

  sendMessage: async (sessionId: string, content: string): Promise<Message> => {
    return apiClient.post<Message>(`/sessions/${sessionId}/message`, { content });
  },

  getTranscript: async (sessionId: string): Promise<Message[]> => {
    return apiClient.get<Message[]>(`/sessions/${sessionId}/transcript`);
  },

  endSession: async (sessionId: string): Promise<Session> => {
    return apiClient.post<Session>(`/sessions/${sessionId}/end`);
  },
};

export default sessionService;
