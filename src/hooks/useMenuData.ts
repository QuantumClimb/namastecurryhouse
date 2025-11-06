import { useQuery } from '@tanstack/react-query';
import { getMenuData } from '../services/menuService';
import { MenuData } from '../types/menu';

/**
 * Custom hook to fetch and cache menu data using React Query.
 * The menu data will be cached for 10 minutes and preloaded on app initialization.
 */
export function useMenuData() {
  return useQuery<MenuData, Error>({
    queryKey: ['menuData'],
    queryFn: getMenuData,
    staleTime: 1000 * 60 * 10, // Consider data fresh for 10 minutes
    gcTime: 1000 * 60 * 30, // Keep in cache for 30 minutes (formerly cacheTime)
    refetchOnWindowFocus: false, // Don't refetch when window regains focus
    refetchOnMount: false, // Don't refetch on component mount if data exists
  });
}

/**
 * Prefetch menu data - call this early in the app lifecycle
 */
export function prefetchMenuData(queryClient: any) {
  return queryClient.prefetchQuery({
    queryKey: ['menuData'],
    queryFn: getMenuData,
    staleTime: 1000 * 60 * 10,
  });
}
