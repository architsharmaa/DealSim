import apiClient from '../client';
import type { Persona } from '../../types/api';

export const personaService = {
  getPersonas: async (): Promise<Persona[]> => {
    return apiClient.get<Persona[]>('/personas');
  },

  getPersonaById: async (id: string): Promise<Persona> => {
    return apiClient.get<Persona>(`/personas/${id}`);
  },

  createPersona: async (data: Partial<Persona>): Promise<Persona> => {
    return apiClient.post<Persona>('/personas', data);
  },
};

export default personaService;
