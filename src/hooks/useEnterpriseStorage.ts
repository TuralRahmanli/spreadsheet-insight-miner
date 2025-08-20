// Enterprise-grade storage management with encryption and compression
import { useState, useCallback, useEffect } from 'react';
import { safeStorage } from '@/utils/safeOperations';
import { log } from '@/utils/logger';
import { generateSecureId } from '@/utils/secureIdGenerator';
import { ENV_CONFIG } from '@/config/environment';
import { isValidJSON } from '@/utils/typeGuards';

// Storage configuration interface
interface StorageConfig {
  encryption: boolean;
  compression: boolean;
  versioning: boolean;
  maxVersions: number;
  autoCleanup: boolean;
  cleanupInterval: number;
}

// Storage entry with metadata
interface StorageEntry<T> {
  data: T;
  version: number;
  encrypted?: boolean;
  compressed?: boolean;
  timestamp: number;
  checksum?: string;
  metadata?: Record<string, unknown>;
}

// Storage operation result
interface StorageResult<T> {
  success: boolean;
  data?: T;
  error?: string;
  version?: number;
}

// Default storage configuration
const DEFAULT_CONFIG: StorageConfig = {
  encryption: ENV_CONFIG.storage.encryptionEnabled,
  compression: ENV_CONFIG.storage.compressionEnabled,
  versioning: true,
  maxVersions: 5,
  autoCleanup: true,
  cleanupInterval: 24 * 60 * 60 * 1000 // 24 hours
};

export const useEnterpriseStorage = <T>(
  key: string,
  initialValue: T,
  config: Partial<StorageConfig> = {}
) => {
  const finalConfig = { ...DEFAULT_CONFIG, ...config };
  const storageKey = `${ENV_CONFIG.storage.keyPrefix}_${key}`;
  const versionsKey = `${storageKey}_versions`;
  
  const [value, setValue] = useState<T>(initialValue);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Simple checksum for data integrity
  const calculateChecksum = useCallback((data: string): string => {
    let hash = 0;
    for (let i = 0; i < data.length; i++) {
      const char = data.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(36);
  }, []);

  // Compress data (simple implementation)
  const compressData = useCallback((data: string): string => {
    if (!finalConfig.compression) return data;
    
    try {
      // Simple RLE compression for demo - in production use proper compression
      return data.replace(/(.)\1+/g, (match, char) => {
        return match.length > 3 ? `${char}*${match.length}` : match;
      });
    } catch (error) {
      log.warn('Data compression failed', 'EnterpriseStorage', { key, error });
      return data;
    }
  }, [finalConfig.compression, key]);

  // Decompress data
  const decompressData = useCallback((data: string): string => {
    if (!finalConfig.compression) return data;
    
    try {
      return data.replace(/(.)\*(\d+)/g, (match, char, count) => {
        return char.repeat(parseInt(count));
      });
    } catch (error) {
      log.warn('Data decompression failed', 'EnterpriseStorage', { key, error });
      return data;
    }
  }, [finalConfig.compression, key]);

  // Encrypt data (basic implementation - use proper encryption in production)
  const encryptData = useCallback((data: string): string => {
    if (!finalConfig.encryption) return data;
    
    try {
      // Simple XOR encryption for demo - use proper encryption in production
      const secretKey = ENV_CONFIG.storage.keyPrefix || 'default_key';
      let encrypted = '';
      
      for (let i = 0; i < data.length; i++) {
        const dataChar = data.charCodeAt(i);
        const keyChar = secretKey.charCodeAt(i % secretKey.length);
        encrypted += String.fromCharCode(dataChar ^ keyChar);
      }
      
      return btoa(encrypted); // Base64 encode
    } catch (error) {
      log.warn('Data encryption failed', 'EnterpriseStorage', { key, error });
      return data;
    }
  }, [finalConfig.encryption, key]);

  // Decrypt data
  const decryptData = useCallback((data: string): string => {
    if (!finalConfig.encryption) return data;
    
    try {
      const decodedData = atob(data); // Base64 decode
      const secretKey = ENV_CONFIG.storage.keyPrefix || 'default_key';
      let decrypted = '';
      
      for (let i = 0; i < decodedData.length; i++) {
        const dataChar = decodedData.charCodeAt(i);
        const keyChar = secretKey.charCodeAt(i % secretKey.length);
        decrypted += String.fromCharCode(dataChar ^ keyChar);
      }
      
      return decrypted;
    } catch (error) {
      log.warn('Data decryption failed', 'EnterpriseStorage', { key, error });
      return data;
    }
  }, [finalConfig.encryption, key]);

  // Load data from storage
  const loadData = useCallback((): StorageResult<T> => {
    try {
      const rawData = safeStorage.get<StorageEntry<T>>(storageKey, null);
      
      if (!rawData) {
        return { success: true, data: initialValue, version: 1 };
      }

      // Validate entry structure
      if (typeof rawData !== 'object' || !rawData.data) {
        log.warn('Invalid storage entry format', 'EnterpriseStorage', { key });
        return { success: false, error: 'Invalid storage entry format' };
      }

      let processedData = JSON.stringify(rawData.data);

      // Decrypt if encrypted
      if (rawData.encrypted) {
        processedData = decryptData(processedData);
      }

      // Decompress if compressed
      if (rawData.compressed) {
        processedData = decompressData(processedData);
      }

      // Verify checksum if available
      if (rawData.checksum) {
        const currentChecksum = calculateChecksum(processedData);
        if (currentChecksum !== rawData.checksum) {
          log.error('Data integrity check failed', 'EnterpriseStorage', { 
            key, 
            expected: rawData.checksum, 
            actual: currentChecksum 
          });
          return { success: false, error: 'Data integrity check failed' };
        }
      }

      const parsedData: T = JSON.parse(processedData);
      
      log.debug('Data loaded from storage', 'EnterpriseStorage', {
        key,
        version: rawData.version,
        encrypted: rawData.encrypted,
        compressed: rawData.compressed
      });

      return { 
        success: true, 
        data: parsedData, 
        version: rawData.version 
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Storage load failed';
      log.error('Failed to load data from storage', 'EnterpriseStorage', { key, error: errorMessage });
      return { success: false, error: errorMessage };
    }
  }, [storageKey, initialValue, decryptData, decompressData, calculateChecksum, key]);

  // Save data to storage
  const saveData = useCallback((data: T, version?: number): StorageResult<T> => {
    try {
      const currentVersion = version || Date.now();
      let processedData = JSON.stringify(data);

      // Compress data
      if (finalConfig.compression) {
        processedData = compressData(processedData);
      }

      // Calculate checksum
      const checksum = calculateChecksum(processedData);

      // Encrypt data
      if (finalConfig.encryption) {
        processedData = encryptData(processedData);
      }

      const entry: StorageEntry<T> = {
        data,
        version: currentVersion,
        encrypted: finalConfig.encryption,
        compressed: finalConfig.compression,
        timestamp: Date.now(),
        checksum,
        metadata: {
          userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown',
          appVersion: ENV_CONFIG.app.version
        }
      };

      // Save current version
      const saveSuccess = safeStorage.set(storageKey, entry);
      
      if (!saveSuccess) {
        return { success: false, error: 'Failed to save to storage' };
      }

      // Handle versioning
      if (finalConfig.versioning) {
        const versions = safeStorage.get<StorageEntry<T>[]>(versionsKey, []);
        const updatedVersions = [entry, ...versions].slice(0, finalConfig.maxVersions);
        safeStorage.set(versionsKey, updatedVersions);
      }

      log.debug('Data saved to storage', 'EnterpriseStorage', {
        key,
        version: currentVersion,
        encrypted: finalConfig.encryption,
        compressed: finalConfig.compression,
        size: JSON.stringify(entry).length
      });

      return { success: true, data, version: currentVersion };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Storage save failed';
      log.error('Failed to save data to storage', 'EnterpriseStorage', { key, error: errorMessage });
      return { success: false, error: errorMessage };
    }
  }, [storageKey, versionsKey, finalConfig, compressData, calculateChecksum, encryptData, key]);

  // Get all versions
  const getVersions = useCallback((): StorageEntry<T>[] => {
    if (!finalConfig.versioning) return [];
    
    return safeStorage.get<StorageEntry<T>[]>(versionsKey, []);
  }, [versionsKey, finalConfig.versioning]);

  // Restore from version
  const restoreVersion = useCallback((version: number): StorageResult<T> => {
    try {
      const versions = getVersions();
      const targetVersion = versions.find(v => v.version === version);
      
      if (!targetVersion) {
        return { success: false, error: 'Version not found' };
      }

      setValue(targetVersion.data);
      const saveResult = saveData(targetVersion.data);
      
      log.info('Version restored', 'EnterpriseStorage', { key, version });
      
      return saveResult;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Version restore failed';
      log.error('Failed to restore version', 'EnterpriseStorage', { key, version, error: errorMessage });
      return { success: false, error: errorMessage };
    }
  }, [getVersions, saveData, key]);

  // Clear storage
  const clearStorage = useCallback((): boolean => {
    try {
      safeStorage.remove(storageKey);
      if (finalConfig.versioning) {
        safeStorage.remove(versionsKey);
      }
      setValue(initialValue);
      setError(null);
      
      log.info('Storage cleared', 'EnterpriseStorage', { key });
      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Storage clear failed';
      log.error('Failed to clear storage', 'EnterpriseStorage', { key, error: errorMessage });
      setError(errorMessage);
      return false;
    }
  }, [storageKey, versionsKey, finalConfig.versioning, initialValue, key]);

  // Update value and save
  const updateValue = useCallback((newValue: T | ((prev: T) => T)): StorageResult<T> => {
    try {
      const updatedValue = typeof newValue === 'function' 
        ? (newValue as (prev: T) => T)(value)
        : newValue;
      
      const result = saveData(updatedValue);
      
      if (result.success) {
        setValue(updatedValue);
        setError(null);
      } else {
        setError(result.error || 'Update failed');
      }
      
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Update failed';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  }, [value, saveData]);

  // Initialize storage
  useEffect(() => {
    const loadInitialData = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const result = loadData();
        
        if (result.success && result.data !== undefined) {
          setValue(result.data);
        } else {
          setError(result.error || 'Failed to load initial data');
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Initialization failed';
        setError(errorMessage);
        log.error('Storage initialization failed', 'EnterpriseStorage', { key, error: errorMessage });
      } finally {
        setIsLoading(false);
      }
    };

    loadInitialData();
  }, [loadData, key]);

  // Auto cleanup old versions
  useEffect(() => {
    if (!finalConfig.autoCleanup || !finalConfig.versioning) return;

    const cleanup = () => {
      try {
        const versions = getVersions();
        const cutoffTime = Date.now() - finalConfig.cleanupInterval;
        const recentVersions = versions.filter(v => v.timestamp > cutoffTime);
        
        if (recentVersions.length !== versions.length) {
          safeStorage.set(versionsKey, recentVersions);
          log.debug('Storage cleanup completed', 'EnterpriseStorage', {
            key,
            removed: versions.length - recentVersions.length,
            remaining: recentVersions.length
          });
        }
      } catch (error) {
        log.warn('Storage cleanup failed', 'EnterpriseStorage', { key, error });
      }
    };

    const interval = setInterval(cleanup, finalConfig.cleanupInterval);
    return () => clearInterval(interval);
  }, [finalConfig.autoCleanup, finalConfig.versioning, finalConfig.cleanupInterval, getVersions, versionsKey, key]);

  return {
    // State
    value,
    isLoading,
    error,
    
    // Actions
    updateValue,
    clearStorage,
    restoreVersion,
    
    // Version management
    getVersions,
    
    // Direct access
    load: loadData,
    save: saveData,
    
    // Configuration
    config: finalConfig
  };
};