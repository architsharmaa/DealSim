import { useMutation, useQueryClient } from '@tanstack/react-query';
import sessionService from '../api/services/sessionService';

export const useSendMessage = (sessionId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (content: string) => sessionService.sendMessage(sessionId, content),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transcript', sessionId] });
    },
  });
};

export default useSendMessage;
