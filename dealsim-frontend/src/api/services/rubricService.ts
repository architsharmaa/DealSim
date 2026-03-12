import apiClient from '../client';
import type { Rubric } from '../../types/api';

export const rubricService = {
  getRubrics: async (): Promise<Rubric[]> => {
    return apiClient.get<Rubric[]>('/rubrics');
  },

  getRubricById: async (id: string): Promise<Rubric> => {
    return apiClient.get<Rubric>(`/rubrics/${id}`);
  },
};

export default rubricService;
