import { useState, useEffect, useCallback } from 'react';
import { useOfflineSync } from './useOfflineSync';
import { toast } from '@/hooks/use-toast';

interface QueuedAction {
  id: string;
  type: 'ADD_PRODUCT' | 'UPDATE_PRODUCT' | 'DELETE_PRODUCT' | 'ADD_WAREHOUSE' | 'UPDATE_WAREHOUSE' | 'DELETE_WAREHOUSE' | 'ADD_OPERATION';
  data: Record<string, unknown>;
  timestamp: number;
  status: 'pending' | 'syncing' | 'failed';
}

export const useOfflineQueue = () => {
  const [queue, setQueue] = useState<QueuedAction[]>([]);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const { storeOfflineAction, triggerSync } = useOfflineSync();

  // Monitor online/offline status
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      triggerSync(); // Automatically sync when coming back online
      toast({
        title: "İnternet bağlantısı bərpa olundu",
        description: "Offline əməliyyatlar sinxronlaşdırılır...",
      });
    };

    const handleOffline = () => {
      setIsOnline(false);
      toast({
        title: "İnternet bağlantısı kəsildi",
        description: "Əməliyyatlar offline saxlanacaq",
        variant: "destructive",
      });
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [triggerSync]);

  // Add action to offline queue
  const addToQueue = useCallback(async (type: QueuedAction['type'], data: Record<string, unknown>) => {
    const action: QueuedAction = {
      id: `${type}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type,
      data,
      timestamp: Date.now(),
      status: 'pending'
    };

    setQueue(prev => [...prev, action]);
    
    // Store in service worker for background sync
    await storeOfflineAction(type, data);

    toast({
      title: "Əməliyyat növbəyə əlavə edildi",
      description: isOnline ? "Sinxronlaşdırılır..." : "İnternet bağlantısı bərpa olanda sinxronlaşdırılacaq",
    });

    return action.id;
  }, [storeOfflineAction, isOnline]);

  // Remove action from queue
  const removeFromQueue = useCallback((actionId: string) => {
    setQueue(prev => prev.filter(action => action.id !== actionId));
  }, []);

  // Update action status
  const updateActionStatus = useCallback((actionId: string, status: QueuedAction['status']) => {
    setQueue(prev => prev.map(action => 
      action.id === actionId ? { ...action, status } : action
    ));
  }, []);

  // Get pending actions count
  const pendingCount = queue.filter(action => action.status === 'pending').length;

  return {
    queue,
    isOnline,
    addToQueue,
    removeFromQueue,
    updateActionStatus,
    pendingCount,
    triggerSync
  };
};