import React, { useState, useCallback, useRef } from 'react';
import { toast } from '@/hooks/use-toast';

interface RetryConfig {
  maxRetries: number;
  baseDelay: number;
  maxDelay: number;
  backoffFactor: number;
}

interface NetworkRequest {
  id: string;
  url: string;
  options: RequestInit;
  retries: number;
  timestamp: number;
}

const DEFAULT_CONFIG: RetryConfig = {
  maxRetries: 3,
  baseDelay: 1000, // 1 second
  maxDelay: 30000, // 30 seconds
  backoffFactor: 2
};

export function useNetworkResilience(config: Partial<RetryConfig> = {}) {
  const [pendingRequests, setPendingRequests] = useState<Map<string, NetworkRequest>>(new Map());
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const retryTimeouts = useRef<Map<string, NodeJS.Timeout>>(new Map());
  const finalConfig = { ...DEFAULT_CONFIG, ...config };

  // Calculate exponential backoff delay
  const calculateDelay = (retryCount: number) => {
    const delay = finalConfig.baseDelay * Math.pow(finalConfig.backoffFactor, retryCount);
    return Math.min(delay, finalConfig.maxDelay);
  };

  // Enhanced fetch with retry logic
  const resilientFetch = useCallback(async (
    url: string, 
    options: RequestInit = {},
    requestId?: string
  ): Promise<Response> => {
    const id = requestId || `req-${Date.now()}-${Math.random()}`;
    
    const makeRequest = async (retryCount = 0): Promise<Response> => {
      try {
        // Add timeout to prevent hanging requests
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
        
        const response = await fetch(url, {
          ...options,
          signal: controller.signal,
          headers: {
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache',
            ...options.headers
          }
        });

        clearTimeout(timeoutId);

        // Handle different response statuses
        if (response.ok) {
          // Success - remove from pending requests
          setPendingRequests(prev => {
            const newMap = new Map(prev);
            newMap.delete(id);
            return newMap;
          });
          
          // Clear any pending retry
          const timeoutRef = retryTimeouts.current.get(id);
          if (timeoutRef) {
            clearTimeout(timeoutRef);
            retryTimeouts.current.delete(id);
          }
          
          return response;
        }

        // Handle specific error codes
        if (response.status >= 500 || response.status === 429) {
          // Server errors or rate limiting - retry
          throw new Error(`Server error: ${response.status}`);
        }

        if (response.status >= 400 && response.status < 500) {
          // Client errors (except 429) - don't retry
          throw new Error(`Client error: ${response.status} ${response.statusText}`);
        }

        throw new Error(`HTTP error: ${response.status}`);

      } catch (error) {
        console.error(`Request failed (attempt ${retryCount + 1}):`, error);

        // Don't retry if it's an abort error (user cancelled or timeout)
        if (error instanceof Error && error.name === 'AbortError') {
          throw error;
        }

        // Check if we should retry
        if (retryCount < finalConfig.maxRetries) {
          const delay = calculateDelay(retryCount);
          
          // Store/update pending request info
          setPendingRequests(prev => {
            const newMap = new Map(prev);
            newMap.set(id, {
              id,
              url,
              options,
              retries: retryCount + 1,
              timestamp: Date.now()
            });
            return newMap;
          });

          // Show retry notification
          toast({
            title: "Bağlantı problemi",
            description: `${delay / 1000} saniyə sonra yenidən cəhd ediləcək...`,
            duration: Math.min(delay, 5000)
          });

          // Schedule retry
          return new Promise((resolve, reject) => {
            const timeoutId = setTimeout(() => {
              retryTimeouts.current.delete(id);
              makeRequest(retryCount + 1).then(resolve).catch(reject);
            }, delay);
            
            retryTimeouts.current.set(id, timeoutId);
          });
        }

        // Max retries exceeded
        setPendingRequests(prev => {
          const newMap = new Map(prev);
          newMap.delete(id);
          return newMap;
        });

        toast({
          title: "Bağlantı xətası",
          description: "Maksimum cəhd sayı aşıldı. Şəbəkə bağlantısını yoxlayın.",
          variant: "destructive",
          duration: 5000
        });

        throw error;
      }
    };

    return makeRequest();
  }, [finalConfig]);

  // Cancel specific request
  const cancelRequest = useCallback((requestId: string) => {
    const timeoutRef = retryTimeouts.current.get(requestId);
    if (timeoutRef) {
      clearTimeout(timeoutRef);
      retryTimeouts.current.delete(requestId);
    }
    
    setPendingRequests(prev => {
      const newMap = new Map(prev);
      newMap.delete(requestId);
      return newMap;
    });
  }, []);

  // Cancel all pending requests
  const cancelAllRequests = useCallback(() => {
    retryTimeouts.current.forEach((timeoutId) => {
      clearTimeout(timeoutId);
    });
    retryTimeouts.current.clear();
    setPendingRequests(new Map());
  }, []);

  // Retry specific request immediately
  const retryRequest = useCallback((requestId: string) => {
    const request = pendingRequests.get(requestId);
    if (request) {
      cancelRequest(requestId);
      return resilientFetch(request.url, request.options, requestId);
    }
    return Promise.reject(new Error('Request not found'));
  }, [pendingRequests, cancelRequest, resilientFetch]);

  // Monitor network status
  const handleOnline = useCallback(() => {
    setIsOnline(true);
    toast({
      title: "Bağlantı bərpa olundu",
      description: "İnternet bağlantısı yenidən mövcuddur",
    });
    
    // Retry all pending requests
    pendingRequests.forEach((request) => {
      retryRequest(request.id);
    });
  }, [pendingRequests, retryRequest]);

  const handleOffline = useCallback(() => {
    setIsOnline(false);
    toast({
      title: "Bağlantı kəsildi",
      description: "İnternet bağlantısı yoxdur. Əməliyyatlar offline saxlanacaq.",
      variant: "destructive",
    });
  }, []);

  // Set up network event listeners
  React.useEffect(() => {
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [handleOnline, handleOffline]);

  // Cleanup on unmount
  React.useEffect(() => {
    return () => {
      cancelAllRequests();
    };
  }, [cancelAllRequests]);

  return {
    resilientFetch,
    pendingRequests: Array.from(pendingRequests.values()),
    isOnline,
    cancelRequest,
    cancelAllRequests,
    retryRequest,
    config: finalConfig
  };
}