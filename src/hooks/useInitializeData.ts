import { useEffect } from 'react';
import useSupabaseStore from '../store/useSupabaseStore';

export const useInitializeData = () => {
  const loadData = useSupabaseStore((state) => state.loadData);
  const isLoading = useSupabaseStore((state) => state.isLoading);

  useEffect(() => {
    // Load data on app start
    loadData();
  }, [loadData]);

  return { isLoading };
};
