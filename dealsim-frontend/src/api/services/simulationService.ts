import apiClient from '../client';
import type { Simulation } from '../../types/api';

export const simulationService = {
  getSimulations: async (): Promise<Simulation[]> => {
    return apiClient.get<Simulation[]>('/simulations');
  },

  getSimulationById: async (id: string): Promise<Simulation> => {
    return apiClient.get<Simulation>(`/simulations/${id}`);
  },

  createSimulation: async (data: Partial<Simulation>): Promise<Simulation> => {
    return apiClient.post<Simulation>('/simulations', data);
  },

  updateSimulation: async (id: string, data: Partial<Simulation>): Promise<Simulation> => {
    return apiClient.put<Simulation>(`/simulations/${id}`, data);
  },

  deleteSimulation: async (id: string): Promise<void> => {
    return apiClient.delete<void>(`/simulations/${id}`);
  },
};

export default simulationService;
