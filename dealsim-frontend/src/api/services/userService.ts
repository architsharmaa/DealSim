import apiClient from '../client';
import type { User } from '../../types/api';

export const userService = {
  getCurrentUser: async (): Promise<User> => {
    return apiClient.get<User>('/users/me');
  },

  updateProfile: async (data: Partial<User>): Promise<User> => {
    return apiClient.put<User>('/users/me', data);
  },
};

export default userService;
