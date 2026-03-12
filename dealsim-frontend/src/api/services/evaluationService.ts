import apiClient from '../client';
import type { Evaluation } from '../../types/api';

export const evaluationService = {
  getEvaluation: async (sessionId: string): Promise<Evaluation> => {
    return apiClient.get<Evaluation>(`/sessions/${sessionId}/evaluation`);
  },
};

export default evaluationService;
