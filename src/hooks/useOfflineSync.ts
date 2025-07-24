import { useEffect, useCallback } from 'react';
import { useErrorHandler } from './useErrorHandler';

interface OfflineAction {
  id?: number;
  type: string;
  data: Record<string, unknown>;
  timestamp: number;
  synced: boolean;
}

export const useOfflineSync = () => {
  const { handleError } = useErrorHandler();

  // Register service worker and setup background sync
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js')
        .then((registration) => {
          if (process.env.NODE_ENV === 'development') {
            console.log('Service Worker registered successfully:', registration);
          }
          
          // Request persistent notification permission for background sync
          if ('Notification' in window && Notification.permission === 'default') {
            Notification.requestPermission();
          }
        })
        .catch((error) => {
          console.error('Service Worker registration failed:', error);
          handleError(error, 'Service Worker Registration');
        });
    }
  }, [handleError]);

  // Store action for offline sync
  const storeOfflineAction = useCallback(async (type: string, data: Record<string, unknown>) => {
    try {
      if ('serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.ready;
        
        // Store action in IndexedDB via service worker
        const action: OfflineAction = {
          type,
          data,
          timestamp: Date.now(),
          synced: false
        };

        // Post message to service worker to store the action
        if (registration.active) {
          registration.active.postMessage({
            type: 'STORE_OFFLINE_ACTION',
            action
          });
        }

        // Try to sync immediately if online
        if (navigator.onLine && 'serviceWorker' in navigator) {
          try {
            // Check if background sync is supported
            if ('sync' in registration) {
              await (registration as ServiceWorkerRegistration & { sync: { register: (tag: string) => Promise<void> } }).sync.register('background-sync');
            }
          } catch (syncError) {
            if (process.env.NODE_ENV === 'development') {
              console.log('Background sync registration failed, will try on next online event');
            }
          }
        }
      }
    } catch (error) {
      handleError(error, 'Storing offline action');
    }
  }, [handleError]);

  // Manual sync trigger
  const triggerSync = useCallback(async () => {
    try {
      if ('serviceWorker' in navigator && navigator.onLine) {
        const registration = await navigator.serviceWorker.ready;
        // Check if background sync is supported
        if ('sync' in registration) {
          await (registration as ServiceWorkerRegistration & { sync: { register: (tag: string) => Promise<void> } }).sync.register('background-sync');
        }
      }
    } catch (error) {
      handleError(error, 'Manual sync trigger');
    }
  }, [handleError]);

  return {
    storeOfflineAction,
    triggerSync
  };
};