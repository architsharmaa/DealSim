import { useQuery } from '@tanstack/react-query';
import simulationService from '../api/services/simulationService';

export const useSimulations = () => {
  return useQuery({
    queryKey: ['simulations'],
    queryFn: () => simulationService.getSimulations(),
  });
};

export default useSimulations;
