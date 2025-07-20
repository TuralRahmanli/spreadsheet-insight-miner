import { useCallback } from 'react';

interface RetryOptions {
  maxAttempts?: number;
  delay?: number;
  backoffFactor?: number;
}

export function useRetry() {
  const retry = useCallback(async <T>(
    fn: () => Promise<T>,
    options: RetryOptions = {}
  ): Promise<T> => {
    const { maxAttempts = 3, delay = 1000, backoffFactor = 2 } = options;
    
    let lastError: Error;
    
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error instanceof Error ? error : new Error('Unknown error');
        
        if (attempt === maxAttempts) {
          throw lastError;
        }
        
        // Wait before retry with exponential backoff
        const waitTime = delay * Math.pow(backoffFactor, attempt - 1);
        await new Promise(resolve => setTimeout(resolve, waitTime));
      }
    }
    
    throw lastError!;
  }, []);

  return retry;
}