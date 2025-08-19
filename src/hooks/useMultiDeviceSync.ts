import { useState, useCallback, useRef, useEffect } from 'react';
import { toast } from '@/hooks/use-toast';

interface SyncConflict {
  id: string;
  type: 'PRODUCT' | 'WAREHOUSE' | 'OPERATION';
  itemId: string;
  localVersion: any;
  remoteVersion: any;
  timestamp: number;
  deviceId: string;
  conflictFields: string[];
}

interface SyncStrategy {
  type: 'LAST_WRITE_WINS' | 'MERGE_FIELDS' | 'USER_CHOICE' | 'KEEP_BOTH';
  mergeRules?: Record<string, 'LOCAL' | 'REMOTE' | 'COMBINE'>;
}

interface DeviceInfo {
  id: string;
  name: string;
  lastSeen: number;
  version: string;
  status: 'online' | 'offline';
}

export function useMultiDeviceSync() {
  const [conflicts, setConflicts] = useState<SyncConflict[]>([]);
  const [connectedDevices, setConnectedDevices] = useState<DeviceInfo[]>([]);
  const [currentDevice] = useState<DeviceInfo>(() => ({
    id: localStorage.getItem('deviceId') || `device-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    name: localStorage.getItem('deviceName') || `Cihaz ${new Date().toLocaleDateString()}`,
    lastSeen: Date.now(),
    version: '1.0.0',
    status: 'online'
  }));
  
  const [isResolving, setIsResolving] = useState(false);
  const [syncStrategy, setSyncStrategy] = useState<SyncStrategy>({
    type: 'LAST_WRITE_WINS'
  });
  
  const syncQueueRef = useRef<Map<string, any>>(new Map());
  const heartbeatIntervalRef = useRef<NodeJS.Timeout>();

  // Initialize device ID and name
  useEffect(() => {
    localStorage.setItem('deviceId', currentDevice.id);
    localStorage.setItem('deviceName', currentDevice.name);
  }, [currentDevice]);

  // Detect sync conflicts
  const detectConflict = useCallback((
    localItem: any,
    remoteItem: any,
    type: SyncConflict['type'],
    deviceId: string
  ): SyncConflict | null => {
    if (!localItem || !remoteItem) return null;

    // Compare timestamps
    const localTimestamp = new Date(localItem.updatedAt || localItem.createdAt || 0).getTime();
    const remoteTimestamp = new Date(remoteItem.updatedAt || remoteItem.createdAt || 0).getTime();

    // If same timestamp, no conflict
    if (localTimestamp === remoteTimestamp) return null;

    // Find conflicting fields
    const conflictFields: string[] = [];
    const excludedFields = ['id', 'createdAt', 'updatedAt', 'version'];

    Object.keys(localItem).forEach(key => {
      if (excludedFields.includes(key)) return;
      
      const localValue = JSON.stringify(localItem[key]);
      const remoteValue = JSON.stringify(remoteItem[key]);
      
      if (localValue !== remoteValue) {
        conflictFields.push(key);
      }
    });

    if (conflictFields.length === 0) return null;

    return {
      id: `conflict-${type.toLowerCase()}-${localItem.id}-${Date.now()}`,
      type,
      itemId: localItem.id,
      localVersion: localItem,
      remoteVersion: remoteItem,
      timestamp: Date.now(),
      deviceId,
      conflictFields
    };
  }, []);

  // Resolve conflict automatically based on strategy
  const autoResolveConflict = useCallback((conflict: SyncConflict): any => {
    const { localVersion, remoteVersion, conflictFields } = conflict;

    switch (syncStrategy.type) {
      case 'LAST_WRITE_WINS': {
        const localTime = new Date(localVersion.updatedAt || 0).getTime();
        const remoteTime = new Date(remoteVersion.updatedAt || 0).getTime();
        return localTime > remoteTime ? localVersion : remoteVersion;
      }

      case 'MERGE_FIELDS': {
        const merged = { ...localVersion };
        const rules = syncStrategy.mergeRules || {};

        conflictFields.forEach(field => {
          const rule = rules[field] || 'REMOTE';
          
          switch (rule) {
            case 'LOCAL':
              merged[field] = localVersion[field];
              break;
            case 'REMOTE':
              merged[field] = remoteVersion[field];
              break;
            case 'COMBINE':
              // Try to combine values if possible
              if (Array.isArray(localVersion[field]) && Array.isArray(remoteVersion[field])) {
                merged[field] = [...new Set([...localVersion[field], ...remoteVersion[field]])];
              } else if (typeof localVersion[field] === 'number' && typeof remoteVersion[field] === 'number') {
                merged[field] = Math.max(localVersion[field], remoteVersion[field]);
              } else {
                merged[field] = `${localVersion[field]} | ${remoteVersion[field]}`;
              }
              break;
          }
        });

        merged.updatedAt = new Date().toISOString();
        return merged;
      }

      case 'KEEP_BOTH': {
        // Create two separate items
        const localCopy = { 
          ...localVersion, 
          id: `${localVersion.id}_local_${currentDevice.id}`,
          name: `${localVersion.name} (Local Copy)`
        };
        const remoteCopy = { 
          ...remoteVersion, 
          id: `${remoteVersion.id}_remote_${conflict.deviceId}`,
          name: `${remoteVersion.name} (Remote Copy)`
        };
        return [localCopy, remoteCopy];
      }

      default:
        return localVersion;
    }
  }, [syncStrategy, currentDevice.id]);

  // Resolve conflict with user choice
  const resolveConflictManually = useCallback(async (
    conflictId: string,
    resolution: 'LOCAL' | 'REMOTE' | 'MERGE' | 'CUSTOM',
    customData?: any
  ) => {
    const conflict = conflicts.find(c => c.id === conflictId);
    if (!conflict) return null;

    setIsResolving(true);

    try {
      let resolvedData: any;

      switch (resolution) {
        case 'LOCAL':
          resolvedData = conflict.localVersion;
          break;
        case 'REMOTE':
          resolvedData = conflict.remoteVersion;
          break;
        case 'MERGE':
          resolvedData = autoResolveConflict(conflict);
          break;
        case 'CUSTOM':
          resolvedData = customData;
          break;
        default:
          resolvedData = conflict.localVersion;
      }

      // Remove conflict from list
      setConflicts(prev => prev.filter(c => c.id !== conflictId));

      toast({
        title: "Konflikt həll edildi",
        description: `${conflict.type} məlumatları yeniləndi`,
      });

      return resolvedData;
    } catch (error) {
      console.error('Conflict resolution error:', error);
      toast({
        title: "Konflikt həll edilmədi",
        description: "Xəta baş verdi, yenidən cəhd edin",
        variant: "destructive"
      });
      return null;
    } finally {
      setIsResolving(false);
    }
  }, [conflicts, autoResolveConflict]);

  // Process sync queue
  const processSyncQueue = useCallback(async () => {
    const queueEntries = Array.from(syncQueueRef.current.entries());
    if (queueEntries.length === 0) return;

    for (const [itemId, data] of queueEntries) {
      try {
        // Simulate API call to sync data
        console.log('Syncing item:', itemId, data);
        
        // Remove from queue after successful sync
        syncQueueRef.current.delete(itemId);
      } catch (error) {
        console.error(`Sync failed for item ${itemId}:`, error);
      }
    }
  }, []);

  // Add item to sync queue
  const queueForSync = useCallback((itemId: string, data: any, priority: 'high' | 'normal' | 'low' = 'normal') => {
    syncQueueRef.current.set(itemId, {
      ...data,
      priority,
      queuedAt: Date.now(),
      deviceId: currentDevice.id
    });

    // Process queue immediately for high priority items
    if (priority === 'high') {
      processSyncQueue();
    }
  }, [currentDevice.id, processSyncQueue]);

  // Simulate conflict detection from remote changes
  const handleRemoteChange = useCallback((
    remoteItem: any,
    type: SyncConflict['type'],
    deviceId: string
  ) => {
    // Get local version (this would come from your data store)
    const localItem = null; // Replace with actual local data fetch
    
    if (!localItem) {
      // No local version, accept remote
      toast({
        title: "Uzaqdan dəyişiklik",
        description: `Yeni ${type.toLowerCase()} məlumatı sinxronlaşdırıldı`,
      });
      return remoteItem;
    }

    const conflict = detectConflict(localItem, remoteItem, type, deviceId);
    
    if (conflict) {
      setConflicts(prev => [...prev, conflict]);
      
      toast({
        title: "Sinxronlaşma konflikti",
        description: `${type} məlumatında konflikt aşkarlandı`,
        variant: "destructive"
      });

      // Auto-resolve if strategy allows
      if (syncStrategy.type !== 'USER_CHOICE') {
        return autoResolveConflict(conflict);
      }
    } else {
      // No conflict, accept remote changes
      return remoteItem;
    }

    return null;
  }, [detectConflict, syncStrategy.type, autoResolveConflict]);

  // Device heartbeat
  const startHeartbeat = useCallback(() => {
    if (heartbeatIntervalRef.current) {
      clearInterval(heartbeatIntervalRef.current);
    }

    heartbeatIntervalRef.current = setInterval(() => {
      // Update device status and send heartbeat
      const heartbeatData = {
        deviceId: currentDevice.id,
        deviceName: currentDevice.name,
        timestamp: Date.now(),
        version: currentDevice.version,
        queueSize: syncQueueRef.current.size
      };

      // Simulate sending heartbeat to server
      console.log('Device heartbeat:', heartbeatData);

      // Update connected devices list (simulate receiving from server)
      setConnectedDevices(prev => prev.map(device => 
        device.id === currentDevice.id 
          ? { ...device, lastSeen: Date.now(), status: 'online' }
          : device
      ));

      // Process sync queue periodically
      processSyncQueue();
    }, 30000); // Every 30 seconds
  }, [currentDevice, processSyncQueue]);

  // Stop heartbeat
  const stopHeartbeat = useCallback(() => {
    if (heartbeatIntervalRef.current) {
      clearInterval(heartbeatIntervalRef.current);
      heartbeatIntervalRef.current = undefined;
    }
  }, []);

  // Update sync strategy
  const updateSyncStrategy = useCallback((strategy: SyncStrategy) => {
    setSyncStrategy(strategy);
    
    toast({
      title: "Sinxronlaşma strategiyası yeniləndi",
      description: `Yeni strategiya: ${strategy.type.replace('_', ' ').toLowerCase()}`,
    });
  }, []);

  // Get conflict statistics
  const getConflictStats = useCallback(() => {
    const stats = {
      total: conflicts.length,
      byType: {} as Record<string, number>,
      oldestConflict: conflicts.length > 0 ? Math.min(...conflicts.map(c => c.timestamp)) : null,
      newestConflict: conflicts.length > 0 ? Math.max(...conflicts.map(c => c.timestamp)) : null
    };

    conflicts.forEach(conflict => {
      stats.byType[conflict.type] = (stats.byType[conflict.type] || 0) + 1;
    });

    return stats;
  }, [conflicts]);

  // Initialize heartbeat on mount
  useEffect(() => {
    startHeartbeat();
    return () => stopHeartbeat();
  }, [startHeartbeat, stopHeartbeat]);

  // Update device name
  const updateDeviceName = useCallback((name: string) => {
    const updatedDevice = { ...currentDevice, name };
    localStorage.setItem('deviceName', name);
    
    toast({
      title: "Cihaz adı yeniləndi",
      description: `Yeni ad: ${name}`,
    });
  }, [currentDevice]);

  return {
    // State
    conflicts,
    connectedDevices,
    currentDevice,
    isResolving,
    syncStrategy,
    queueSize: syncQueueRef.current.size,
    
    // Actions
    resolveConflictManually,
    queueForSync,
    handleRemoteChange,
    updateSyncStrategy,
    updateDeviceName,
    
    // Utilities
    getConflictStats,
    processSyncQueue,
    
    // Device management
    startHeartbeat,
    stopHeartbeat
  };
}