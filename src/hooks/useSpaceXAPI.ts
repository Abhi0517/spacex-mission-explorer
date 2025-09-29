import { useQuery } from '@tanstack/react-query';
import { SpaceXLaunch, SpaceXRocket } from '@/types/spacex';

const SPACEX_API_BASE = 'https://api.spacexdata.com/v4';

export const useSpaceXLaunches = () => {
  return useQuery<SpaceXLaunch[]>({
    queryKey: ['spacex-launches'],
    queryFn: async () => {
      const response = await fetch(`${SPACEX_API_BASE}/launches`);
      if (!response.ok) {
        throw new Error('Failed to fetch launches');
      }
      return response.json();
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useSpaceXRocket = (rocketId: string) => {
  return useQuery<SpaceXRocket>({
    queryKey: ['spacex-rocket', rocketId],
    queryFn: async () => {
      const response = await fetch(`${SPACEX_API_BASE}/rockets/${rocketId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch rocket data');
      }
      return response.json();
    },
    enabled: !!rocketId,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};