import { useState, useEffect, useCallback } from 'react';

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
}

interface CacheOptions {
  ttl?: number; // Time to live in milliseconds
  maxSize?: number; // Maximum cache size
}

export function useCache<T>(options: CacheOptions = {}) {
  const { ttl = 5 * 60 * 1000, maxSize = 100 } = options; // Default 5 minutes TTL
  const [cache, setCache] = useState<Map<string, CacheEntry<T>>>(new Map());

  // Clean expired entries
  const cleanExpired = useCallback(() => {
    const now = Date.now();
    setCache(prev => {
      const newCache = new Map(prev);
      for (const [key, entry] of newCache.entries()) {
        if (entry.expiresAt < now) {
          newCache.delete(key);
        }
      }
      return newCache;
    });
  }, []);

  // Clean expired entries periodically
  useEffect(() => {
    const interval = setInterval(cleanExpired, ttl / 2);
    return () => clearInterval(interval);
  }, [cleanExpired, ttl]);

  const get = useCallback((key: string): T | null => {
    const entry = cache.get(key);
    if (!entry) return null;
    
    if (entry.expiresAt < Date.now()) {
      setCache(prev => {
        const newCache = new Map(prev);
        newCache.delete(key);
        return newCache;
      });
      return null;
    }
    
    return entry.data;
  }, [cache]);

  const set = useCallback((key: string, data: T): void => {
    const now = Date.now();
    const entry: CacheEntry<T> = {
      data,
      timestamp: now,
      expiresAt: now + ttl
    };

    setCache(prev => {
      const newCache = new Map(prev);
      
      // Remove oldest entries if cache is full
      if (newCache.size >= maxSize) {
        const oldestKey = Array.from(newCache.keys())[0];
        newCache.delete(oldestKey);
      }
      
      newCache.set(key, entry);
      return newCache;
    });
  }, [ttl, maxSize]);

  const remove = useCallback((key: string): void => {
    setCache(prev => {
      const newCache = new Map(prev);
      newCache.delete(key);
      return newCache;
    });
  }, []);

  const clear = useCallback((): void => {
    setCache(new Map());
  }, []);

  const has = useCallback((key: string): boolean => {
    const entry = cache.get(key);
    return entry ? entry.expiresAt > Date.now() : false;
  }, [cache]);

  return { get, set, remove, clear, has };
}