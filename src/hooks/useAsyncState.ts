import { useState, useCallback } from 'react';

interface AsyncState<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
}

export function useAsyncState<T>(
  initialData: T | null = null
): [AsyncState<T>, (promise: Promise<T>) => Promise<T>] {
  const [state, setState] = useState<AsyncState<T>>({
    data: initialData,
    loading: false,
    error: null,
  });

  const execute = useCallback(async (promise: Promise<T>): Promise<T> => {
    setState({ data: state.data, loading: true, error: null });
    
    try {
      const result = await promise;
      setState({ data: result, loading: false, error: null });
      return result;
    } catch (error) {
      const errorObj = error instanceof Error ? error : new Error('Unknown error');
      setState({ data: state.data, loading: false, error: errorObj });
      throw errorObj;
    }
  }, [state.data]);

  return [state, execute];
}