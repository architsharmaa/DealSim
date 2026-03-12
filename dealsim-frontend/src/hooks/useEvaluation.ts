import { useQuery } from '@tanstack/react-query';
import evaluationService from '../api/services/evaluationService';

export const useEvaluation = (sessionId: string) => {
  return useQuery({
    queryKey: ['evaluation', sessionId],
    queryFn: () => evaluationService.getEvaluation(sessionId),
    enabled: !!sessionId,
  });
};

export default useEvaluation;
