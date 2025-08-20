// Enterprise-grade network management with retry, caching, and monitoring
import { useState, useCallback, useEffect, useRef } from 'react';
import { log } from '@/utils/logger';
import { safeApi } from '@/utils/safeOperations';
import { generateRequestId } from '@/utils/secureIdGenerator';
import { ENV_CONFIG } from '@/config/environment';
import { metrics } from '@/utils/performanceMetrics';

// Request configuration interface
interface RequestConfig extends Omit<RequestInit, 'cache'> {
  timeout?: number;
  retries?: number;
  retryDelay?: number;
  enableCache?: boolean;
  cacheKey?: string;
  cacheTTL?: number;
  onProgress?: (loaded: number, total: number) => void;
}

// Request result interface
interface RequestResult<T> {
  success: boolean;
  data?: T;
  error?: string;
  status?: number;
  headers?: Headers;
  requestId: string;
  duration: number;
  fromCache?: boolean;
  retryCount?: number;
}

// Cache entry interface
interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
  requestId: string;
}

// Network status interface
interface NetworkStatus {
  online: boolean;
  connectionType: string;
  latency: number;
  quality: 'excellent' | 'good' | 'poor' | 'offline';
}

// Request queue item
interface QueuedRequest {
  id: string;
  url: string;
  config: RequestConfig;
  resolve: (result: RequestResult<unknown>) => void;
  reject: (error: Error) => void;
  timestamp: number;
}

// Default configuration
const DEFAULT_CONFIG: Required<Omit<RequestConfig, keyof RequestInit | 'onProgress'>> = {
  timeout: ENV_CONFIG.api.timeout,
  retries: ENV_CONFIG.api.retryAttempts,
  retryDelay: 1000,
  enableCache: false,
  cacheKey: '',
  cacheTTL: 5 * 60 * 1000, // 5 minutes
};

export const useEnterpriseNetwork = () => {
  const [isOnline, setIsOnline] = useState(safeApi.isOnline());
  const [networkStatus, setNetworkStatus] = useState<NetworkStatus>({
    online: true,
    connectionType: 'unknown',
    latency: 0,
    quality: 'good'
  });
  const [pendingRequests, setPendingRequests] = useState<Map<string, AbortController>>(new Map());
  const [requestQueue, setRequestQueue] = useState<QueuedRequest[]>([]);
  
  const cacheRef = useRef<Map<string, CacheEntry<unknown>>>(new Map());
  const isProcessingQueue = useRef(false);

  // Network status monitoring
  useEffect(() => {
    const updateOnlineStatus = () => {
      const online = safeApi.isOnline();
      setIsOnline(online);
      
      if (online && requestQueue.length > 0 && !isProcessingQueue.current) {
        processRequestQueue();
      }
    };

    const handleOnline = () => {
      updateOnlineStatus();
      log.info('Network connection restored', 'EnterpriseNetwork');
    };

    const handleOffline = () => {
      updateOnlineStatus();
      log.warn('Network connection lost', 'EnterpriseNetwork');
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('online', handleOnline);
      window.addEventListener('offline', handleOffline);
      
      return () => {
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
      };
    }
  }, [requestQueue.length]);

  // Network quality monitoring
  useEffect(() => {
    const checkNetworkQuality = async () => {
      try {
        const startTime = performance.now();
        const isConnected = await safeApi.checkConnection();
        const latency = performance.now() - startTime;

        let quality: NetworkStatus['quality'];
        if (!isConnected) {
          quality = 'offline';
        } else if (latency < 100) {
          quality = 'excellent';
        } else if (latency < 500) {
          quality = 'good';
        } else {
          quality = 'poor';
        }

        const connectionType = typeof navigator !== 'undefined'
          ? (navigator as Navigator & { connection?: { effectiveType?: string } }).connection?.effectiveType || 'unknown'
          : 'unknown';

        setNetworkStatus({
          online: isConnected,
          connectionType,
          latency,
          quality
        });

        metrics.record('network_quality_check', latency, 'ms', {
          quality,
          connectionType
        });
      } catch (error) {
        log.warn('Network quality check failed', 'EnterpriseNetwork', error);
      }
    };

    // Check network quality every 30 seconds
    const interval = setInterval(checkNetworkQuality, 30000);
    checkNetworkQuality(); // Initial check
    
    return () => clearInterval(interval);
  }, []);

  // Cache management
  const getCachedResponse = useCallback(<T>(cacheKey: string): T | null => {
    const entry = cacheRef.current.get(cacheKey) as CacheEntry<T> | undefined;
    
    if (!entry) return null;
    
    const now = Date.now();
    if (now > entry.timestamp + entry.ttl) {
      cacheRef.current.delete(cacheKey);
      return null;
    }
    
    log.debug('Cache hit', 'EnterpriseNetwork', { cacheKey, age: now - entry.timestamp });
    return entry.data;
  }, []);

  const setCachedResponse = useCallback(<T>(
    cacheKey: string, 
    data: T, 
    ttl: number, 
    requestId: string
  ): void => {
    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      ttl,
      requestId
    };
    
    cacheRef.current.set(cacheKey, entry as CacheEntry<unknown>);
    
    // Cleanup old entries (keep only last 100)
    if (cacheRef.current.size > 100) {
      const entries = Array.from(cacheRef.current.entries());
      entries.sort(([,a], [,b]) => b.timestamp - a.timestamp);
      
      const keepEntries = entries.slice(0, 100);
      cacheRef.current.clear();
      keepEntries.forEach(([key, value]) => {
        cacheRef.current.set(key, value);
      });
    }
    
    log.debug('Response cached', 'EnterpriseNetwork', { cacheKey, ttl });
  }, []);

  // Process offline request queue
  const processRequestQueue = useCallback(async () => {
    if (isProcessingQueue.current || requestQueue.length === 0) return;
    
    isProcessingQueue.current = true;
    log.info('Processing offline request queue', 'EnterpriseNetwork', { queueSize: requestQueue.length });

    const currentQueue = [...requestQueue];
    setRequestQueue([]);

    for (const queuedRequest of currentQueue) {
      try {
        const result = await executeRequest(queuedRequest.url, queuedRequest.config);
        queuedRequest.resolve(result);
      } catch (error) {
        queuedRequest.reject(error instanceof Error ? error : new Error('Queue processing failed'));
      }
    }

    isProcessingQueue.current = false;
  }, [requestQueue]);

  // Execute HTTP request with retries and monitoring
  const executeRequest = useCallback(async <T>(
    url: string,
    config: RequestConfig = {}
  ): Promise<RequestResult<T>> => {
    const requestId = generateRequestId();
    const finalConfig = { ...DEFAULT_CONFIG, ...config };
    const startTime = performance.now();
    
    // Generate cache key
    const cacheKey = finalConfig.cacheKey || `${config.method || 'GET'}_${url}_${JSON.stringify(config.body || {})}`;
    
    // Check cache first
    if (finalConfig.enableCache) {
      const cachedData = getCachedResponse<T>(cacheKey);
      if (cachedData) {
        return {
          success: true,
          data: cachedData,
          requestId,
          duration: performance.now() - startTime,
          fromCache: true
        };
      }
    }

    // Check if we're online
    if (!isOnline) {
      log.warn('Request queued due to offline status', 'EnterpriseNetwork', { url, requestId });
      
      return new Promise((resolve, reject) => {
        const queuedRequest: QueuedRequest = {
          id: requestId,
          url,
          config,
          resolve: resolve as (result: RequestResult<unknown>) => void,
          reject,
          timestamp: Date.now()
        };
        
        setRequestQueue(prev => [...prev, queuedRequest]);
      });
    }

    let lastError: Error | null = null;
    
    for (let attempt = 0; attempt <= finalConfig.retries; attempt++) {
      const attemptStartTime = performance.now();
      const abortController = new AbortController();
      
      // Track pending request
      setPendingRequests(prev => new Map(prev).set(requestId, abortController));
      
      try {
        log.debug('Executing request', 'EnterpriseNetwork', {
          url,
          requestId,
          attempt: attempt + 1,
          maxAttempts: finalConfig.retries + 1
        });

        const timeoutId = setTimeout(() => {
          abortController.abort();
        }, finalConfig.timeout);

        const response = await fetch(url, {
          ...config,
          signal: abortController.signal
        });

        clearTimeout(timeoutId);
        
        const duration = performance.now() - attemptStartTime;
        
        // Record network timing
        metrics.record('network_request_duration', duration, 'ms', {
          url: url.substring(0, 100),
          method: config.method || 'GET',
          status: response.status.toString(),
          attempt: (attempt + 1).toString()
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const contentType = response.headers.get('content-type');
        let data: T;
        
        if (contentType?.includes('application/json')) {
          data = await response.json();
        } else if (contentType?.includes('text/')) {
          data = await response.text() as T;
        } else {
          data = await response.blob() as T;
        }

        // Cache successful response
        if (finalConfig.enableCache && response.status === 200) {
          setCachedResponse(cacheKey, data, finalConfig.cacheTTL, requestId);
        }

        const totalDuration = performance.now() - startTime;
        
        log.info('Request completed successfully', 'EnterpriseNetwork', {
          url,
          requestId,
          status: response.status,
          duration: totalDuration,
          retryCount: attempt
        });

        return {
          success: true,
          data,
          status: response.status,
          headers: response.headers,
          requestId,
          duration: totalDuration,
          retryCount: attempt
        };

      } catch (error) {
        lastError = error instanceof Error ? error : new Error('Request failed');
        
        const duration = performance.now() - attemptStartTime;
        
        log.warn('Request attempt failed', 'EnterpriseNetwork', {
          url,
          requestId,
          attempt: attempt + 1,
          error: lastError.message,
          duration
        });

        // Don't retry on abort or certain errors
        if (abortController.signal.aborted || lastError.name === 'AbortError') {
          break;
        }

        // Wait before retry (except on last attempt)
        if (attempt < finalConfig.retries) {
          await new Promise(resolve => setTimeout(resolve, finalConfig.retryDelay * (attempt + 1)));
        }
        
      } finally {
        // Remove from pending requests
        setPendingRequests(prev => {
          const newMap = new Map(prev);
          newMap.delete(requestId);
          return newMap;
        });
      }
    }

    const totalDuration = performance.now() - startTime;
    const errorMessage = lastError?.message || 'Request failed after retries';
    
    log.error('Request failed after all retries', 'EnterpriseNetwork', {
      url,
      requestId,
      error: errorMessage,
      duration: totalDuration,
      retries: finalConfig.retries
    });

    return {
      success: false,
      error: errorMessage,
      requestId,
      duration: totalDuration,
      retryCount: finalConfig.retries
    };
  }, [isOnline, getCachedResponse, setCachedResponse]);

  // Cancel request
  const cancelRequest = useCallback((requestId: string): boolean => {
    const controller = pendingRequests.get(requestId);
    if (controller) {
      controller.abort();
      setPendingRequests(prev => {
        const newMap = new Map(prev);
        newMap.delete(requestId);
        return newMap;
      });
      
      log.info('Request cancelled', 'EnterpriseNetwork', { requestId });
      return true;
    }
    return false;
  }, [pendingRequests]);

  // Cancel all pending requests
  const cancelAllRequests = useCallback((): number => {
    const count = pendingRequests.size;
    
    pendingRequests.forEach((controller, requestId) => {
      controller.abort();
      log.debug('Request cancelled (bulk)', 'EnterpriseNetwork', { requestId });
    });
    
    setPendingRequests(new Map());
    
    if (count > 0) {
      log.info('All requests cancelled', 'EnterpriseNetwork', { count });
    }
    
    return count;
  }, [pendingRequests]);

  // Clear cache
  const clearCache = useCallback((pattern?: string): number => {
    if (!pattern) {
      const count = cacheRef.current.size;
      cacheRef.current.clear();
      log.info('Cache cleared completely', 'EnterpriseNetwork', { count });
      return count;
    }

    const regex = new RegExp(pattern);
    let count = 0;
    
    for (const [key] of cacheRef.current.entries()) {
      if (regex.test(key)) {
        cacheRef.current.delete(key);
        count++;
      }
    }
    
    log.info('Cache cleared by pattern', 'EnterpriseNetwork', { pattern, count });
    return count;
  }, []);

  const get = useCallback(<T>(url: string, config?: Omit<RequestConfig, 'method'>) => 
    executeRequest<T>(url, { ...config, method: 'GET' }), [executeRequest]);

  const post = useCallback(<T>(url: string, data?: unknown, config?: Omit<RequestConfig, 'method' | 'body'>) =>
    executeRequest<T>(url, { 
      ...config, 
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
      headers: {
        'Content-Type': 'application/json',
        ...config?.headers
      }
    }), [executeRequest]);

  const put = useCallback(<T>(url: string, data?: unknown, config?: Omit<RequestConfig, 'method' | 'body'>) =>
    executeRequest<T>(url, { 
      ...config, 
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
      headers: {
        'Content-Type': 'application/json',
        ...config?.headers
      }
    }), [executeRequest]);

  const del = useCallback(<T>(url: string, config?: Omit<RequestConfig, 'method'>) =>
    executeRequest<T>(url, { ...config, method: 'DELETE' }), [executeRequest]);

  return {
    // State
    isOnline,
    networkStatus,
    pendingRequests: pendingRequests.size,
    queuedRequests: requestQueue.length,
    cacheSize: cacheRef.current.size,
    
    // Core methods
    request: executeRequest,
    get,
    post,
    put,
    delete: del,
    
    // Request management
    cancelRequest,
    cancelAllRequests,
    
    // Cache management
    clearCache,
    getCached: getCachedResponse,
    
    // Queue management
    processQueue: processRequestQueue,
    clearQueue: () => setRequestQueue([])
  };
};
