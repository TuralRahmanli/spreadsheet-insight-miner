import { useCallback, useMemo, useRef, useState, useEffect } from 'react';
import { debounce, throttle } from 'lodash';

interface PerformanceConfig {
  enableVirtualization: boolean;
  enableMemoization: boolean;
  enableDebouncing: boolean;
  enableThrottling: boolean;
  debounceDelay: number;
  throttleDelay: number;
  chunkSize: number;
  maxConcurrentOperations: number;
}

const DEFAULT_CONFIG: PerformanceConfig = {
  enableVirtualization: true,
  enableMemoization: true,
  enableDebouncing: true,
  enableThrottling: true,
  debounceDelay: 300,
  throttleDelay: 100,
  chunkSize: 1000,
  maxConcurrentOperations: 3
};

export function usePerformanceOptimization(config: Partial<PerformanceConfig> = {}) {
  const finalConfig = { ...DEFAULT_CONFIG, ...config };
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const operationQueue = useRef<Array<() => Promise<any>>>([]);
  const activeOperations = useRef<Set<Promise<any>>>(new Set());

  // Debounced function factory
  const createDebouncedFunction = useCallback(<T extends (...args: any[]) => any>(
    fn: T,
    delay?: number
  ): T => {
    if (!finalConfig.enableDebouncing) return fn;
    
    return debounce(fn, delay || finalConfig.debounceDelay) as T;
  }, [finalConfig.enableDebouncing, finalConfig.debounceDelay]);

  // Throttled function factory
  const createThrottledFunction = useCallback(<T extends (...args: any[]) => any>(
    fn: T,
    delay?: number
  ): T => {
    if (!finalConfig.enableThrottling) return fn;
    
    return throttle(fn, delay || finalConfig.throttleDelay) as T;
  }, [finalConfig.enableThrottling, finalConfig.throttleDelay]);

  // Memoized computation
  const memoizeComputation = useCallback(<TArgs extends any[], TReturn>(
    fn: (...args: TArgs) => TReturn,
    deps: React.DependencyList
  ): TReturn => {
    return useMemo(() => fn(...deps as TArgs), deps);
  }, []);

  // Chunk processing for large datasets
  const processInChunks = useCallback(async <T, R>(
    items: T[],
    processor: (chunk: T[]) => Promise<R[]>,
    onProgress?: (progress: number) => void
  ): Promise<R[]> => {
    if (items.length === 0) return [];
    
    setIsProcessing(true);
    setProgress(0);
    
    const results: R[] = [];
    const chunks = [];
    
    // Split into chunks
    for (let i = 0; i < items.length; i += finalConfig.chunkSize) {
      chunks.push(items.slice(i, i + finalConfig.chunkSize));
    }

    try {
      for (let i = 0; i < chunks.length; i++) {
        const chunkResults = await processor(chunks[i]);
        results.push(...chunkResults);
        
        const progressPercent = ((i + 1) / chunks.length) * 100;
        setProgress(progressPercent);
        onProgress?.(progressPercent);
        
        // Allow UI to update between chunks
        await new Promise(resolve => setTimeout(resolve, 0));
      }
    } finally {
      setIsProcessing(false);
      setProgress(0);
    }

    return results;
  }, [finalConfig.chunkSize]);

  // Batch operations with concurrency control
  const batchOperations = useCallback(async <T>(
    operations: Array<() => Promise<T>>,
    onProgress?: (completed: number, total: number) => void
  ): Promise<T[]> => {
    if (operations.length === 0) return [];
    
    setIsProcessing(true);
    const results: T[] = new Array(operations.length);
    let completed = 0;

    try {
      // Process operations in batches to control concurrency
      for (let i = 0; i < operations.length; i += finalConfig.maxConcurrentOperations) {
        const batch = operations.slice(i, i + finalConfig.maxConcurrentOperations);
        
        const batchPromises = batch.map(async (operation, index) => {
          const actualIndex = i + index;
          try {
            const result = await operation();
            results[actualIndex] = result;
            completed++;
            onProgress?.(completed, operations.length);
            return result;
          } catch (error) {
            console.error(`Operation ${actualIndex} failed:`, error);
            throw error;
          }
        });

        await Promise.allSettled(batchPromises);
      }
    } finally {
      setIsProcessing(false);
    }

    return results;
  }, [finalConfig.maxConcurrentOperations]);

  // Queue management for background operations
  const queueOperation = useCallback(async <T>(
    operation: () => Promise<T>
  ): Promise<T> => {
    return new Promise((resolve, reject) => {
      const wrappedOperation = async () => {
        try {
          const promise = operation();
          activeOperations.current.add(promise);
          
          promise.finally(() => {
            activeOperations.current.delete(promise);
          });
          
          const result = await promise;
          resolve(result);
        } catch (error) {
          reject(error);
        }
      };

      operationQueue.current.push(wrappedOperation);
      processQueue();
    });
  }, []);

  // Process queued operations
  const processQueue = useCallback(async () => {
    if (activeOperations.current.size >= finalConfig.maxConcurrentOperations) {
      return;
    }

    const operation = operationQueue.current.shift();
    if (operation) {
      await operation();
      
      // Process next operation if queue is not empty and we have capacity
      if (operationQueue.current.length > 0 && 
          activeOperations.current.size < finalConfig.maxConcurrentOperations) {
        processQueue();
      }
    }
  }, [finalConfig.maxConcurrentOperations]);

  // Memory optimization utilities
  const createWeakMapCache = useCallback(() => {
    return new WeakMap();
  }, []);

  const createLRUCache = useCallback(<K, V>(maxSize: number = 100) => {
    const cache = new Map<K, V>();
    
    return {
      get: (key: K): V | undefined => {
        if (cache.has(key)) {
          // Move to end (most recently used)
          const value = cache.get(key)!;
          cache.delete(key);
          cache.set(key, value);
          return value;
        }
        return undefined;
      },
      set: (key: K, value: V): void => {
        if (cache.has(key)) {
          cache.delete(key);
        } else if (cache.size >= maxSize) {
          // Remove least recently used (first item)
          const firstKey = cache.keys().next().value;
          cache.delete(firstKey);
        }
        cache.set(key, value);
      },
      clear: (): void => {
        cache.clear();
      },
      size: (): number => cache.size
    };
  }, []);

  // Intersection Observer for lazy loading
  const createIntersectionObserver = useCallback((
    callback: (entries: IntersectionObserverEntry[]) => void,
    options?: IntersectionObserverInit
  ) => {
    if (!('IntersectionObserver' in window)) {
      // Fallback for browsers without IntersectionObserver
      return {
        observe: () => {},
        unobserve: () => {},
        disconnect: () => {}
      };
    }

    return new IntersectionObserver(callback, {
      rootMargin: '50px',
      threshold: 0.1,
      ...options
    });
  }, []);

  // Performance monitoring
  const measurePerformance = useCallback(<T>(
    fn: () => T,
    label?: string
  ): T => {
    const startTime = performance.now();
    const result = fn();
    const endTime = performance.now();
    
    if (label && process.env.NODE_ENV === 'development') {
      console.log(`Performance [${label}]: ${endTime - startTime}ms`);
    }
    
    return result;
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      // Cancel all active operations
      activeOperations.current.clear();
      operationQueue.current = [];
    };
  }, []);

  return {
    // Function factories
    createDebouncedFunction,
    createThrottledFunction,
    memoizeComputation,
    
    // Data processing
    processInChunks,
    batchOperations,
    queueOperation,
    
    // Caching
    createWeakMapCache,
    createLRUCache,
    
    // Utilities
    createIntersectionObserver,
    measurePerformance,
    
    // State
    isProcessing,
    progress,
    queueSize: operationQueue.current.length,
    activeOperationsCount: activeOperations.current.size,
    
    // Config
    config: finalConfig
  };
}