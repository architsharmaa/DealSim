import { useQuery } from '@tanstack/react-query';
import simulationService from '../api/services/simulationService';

export const useSimulation = (id: string) => {
  return useQuery({
    queryKey: ['simulation', id],
    queryFn: () => simulationService.getSimulationById(id),
    enabled: !!id,
  });
};

export default useSimulation;
