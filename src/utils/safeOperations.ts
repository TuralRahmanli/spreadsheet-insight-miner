// Enterprise-grade safe operations for DOM, Storage, and API access
import { log } from './logger';

// Safe DOM operations
export const safeDom = {
  querySelector: <T extends Element = Element>(selector: string): T | null => {
    try {
      if (typeof document === 'undefined') return null;
      return document.querySelector<T>(selector);
    } catch (error) {
      log.warn('DOM query failed', 'safeDom.querySelector', { selector, error });
      return null;
    }
  },

  querySelectorAll: <T extends Element = Element>(selector: string): T[] => {
    try {
      if (typeof document === 'undefined') return [];
      return Array.from(document.querySelectorAll<T>(selector));
    } catch (error) {
      log.warn('DOM query all failed', 'safeDom.querySelectorAll', { selector, error });
      return [];
    }
  },

  createElement: <T extends keyof HTMLElementTagNameMap>(tagName: T): HTMLElementTagNameMap[T] | null => {
    try {
      if (typeof document === 'undefined') return null;
      return document.createElement(tagName);
    } catch (error) {
      log.warn('Create element failed', 'safeDom.createElement', { tagName, error });
      return null;
    }
  },

  addEventListener: (
    element: EventTarget | null,
    event: string,
    handler: EventListener,
    options?: AddEventListenerOptions
  ): (() => void) => {
    try {
      if (!element) return () => {};
      element.addEventListener(event, handler, options);
      return () => element.removeEventListener(event, handler, options);
    } catch (error) {
      log.warn('Add event listener failed', 'safeDom.addEventListener', { event, error });
      return () => {};
    }
  }
};

// Safe window operations
export const safeWindow = {
  getSize: (): { width: number; height: number } => {
    try {
      if (typeof window === 'undefined') return { width: 1024, height: 768 };
      return { width: window.innerWidth, height: window.innerHeight };
    } catch (error) {
      log.warn('Get window size failed', 'safeWindow.getSize', error);
      return { width: 1024, height: 768 };
    }
  },

  matchMedia: (query: string): boolean => {
    try {
      if (typeof window === 'undefined') return false;
      return window.matchMedia(query).matches;
    } catch (error) {
      log.warn('Match media failed', 'safeWindow.matchMedia', { query, error });
      return false;
    }
  },

  location: {
    get href(): string {
      try {
        if (typeof window === 'undefined') return '';
        return window.location.href;
      } catch (error) {
        log.warn('Get location href failed', 'safeWindow.location.href', error);
        return '';
      }
    },

    reload: (): void => {
      try {
        if (typeof window !== 'undefined') {
          window.location.reload();
        }
      } catch (error) {
        log.error('Window reload failed', 'safeWindow.location.reload', error);
      }
    }
  },

  open: (url: string, target?: string, features?: string): Window | null => {
    try {
      if (typeof window === 'undefined') return null;
      return window.open(url, target, features);
    } catch (error) {
      log.warn('Window open failed', 'safeWindow.open', { url, target, features, error });
      return null;
    }
  }
};

// Safe localStorage operations with validation
export const safeStorage = {
  get: <T>(key: string, defaultValue: T): T => {
    try {
      if (typeof window === 'undefined') return defaultValue;
      const item = localStorage.getItem(key);
      if (!item) return defaultValue;
      return JSON.parse(item);
    } catch (error) {
      log.warn('Storage get failed', 'safeStorage.get', { key, error });
      return defaultValue;
    }
  },

  set: <T>(key: string, value: T): boolean => {
    try {
      if (typeof window === 'undefined') return false;
      const serialized = JSON.stringify(value);
      localStorage.setItem(key, serialized);
      return true;
    } catch (error) {
      log.warn('Storage set failed', 'safeStorage.set', { key, error });
      return false;
    }
  },

  remove: (key: string): boolean => {
    try {
      if (typeof window === 'undefined') return false;
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      log.warn('Storage remove failed', 'safeStorage.remove', { key, error });
      return false;
    }
  },

  clear: (): boolean => {
    try {
      if (typeof window === 'undefined') return false;
      localStorage.clear();
      return true;
    } catch (error) {
      log.warn('Storage clear failed', 'safeStorage.clear', error);
      return false;
    }
  },

  isAvailable: (): boolean => {
    try {
      if (typeof window === 'undefined') return false;
      const testKey = '__storage_test__';
      localStorage.setItem(testKey, 'test');
      localStorage.removeItem(testKey);
      return true;
    } catch {
      return false;
    }
  }
};

// Safe async operations
export const safeAsync = {
  timeout: <T>(promise: Promise<T>, ms: number): Promise<T> => {
    return Promise.race([
      promise,
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error(`Operation timed out after ${ms}ms`)), ms)
      )
    ]);
  },

  retry: async <T>(
    operation: () => Promise<T>,
    retries: number = 3,
    delay: number = 1000
  ): Promise<T> => {
    let lastError: Error;
    
    for (let i = 0; i <= retries; i++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        if (i < retries) {
          log.warn(`Operation failed, retrying in ${delay}ms`, 'safeAsync.retry', { 
            attempt: i + 1, 
            error: lastError.message 
          });
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }
    
    throw lastError!;
  }
};

// Safe API operations
export const safeApi = {
  isOnline: (): boolean => {
    try {
      if (typeof navigator === 'undefined') return true;
      return navigator.onLine;
    } catch {
      return true;
    }
  },

  checkConnection: async (): Promise<boolean> => {
    try {
      const response = await fetch('/favicon.ico', { 
        method: 'HEAD',
        cache: 'no-cache',
        mode: 'no-cors'
      });
      return true;
    } catch {
      return false;
    }
  }
};