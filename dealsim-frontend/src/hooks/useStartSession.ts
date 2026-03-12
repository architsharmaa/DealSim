import { useMutation, useQueryClient } from '@tanstack/react-query';
import sessionService from '../api/services/sessionService';

export const useStartSession = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (simulationId: string) => sessionService.startSession(simulationId),
    onSuccess: (newSession) => {
      queryClient.setQueryData(['session', newSession.id], newSession);
      queryClient.invalidateQueries({ queryKey: ['sessions'] });
    },
  });
};

export default useStartSession;
