import apiClient from '../client';
import type { Context } from '../../types/api';

export const contextService = {
  getContexts: async (): Promise<Context[]> => {
    return apiClient.get<Context[]>('/contexts');
  },

  getContextById: async (id: string): Promise<Context> => {
    return apiClient.get<Context>(`/contexts/${id}`);
  },
};

export default contextService;
