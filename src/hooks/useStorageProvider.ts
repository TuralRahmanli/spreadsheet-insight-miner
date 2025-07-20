import { useState, useEffect } from 'react';
import { useLocalStorage } from './useLocalStorage';

export type StorageProvider = 'local' | 'google-drive';

interface StorageConfig {
  provider: StorageProvider;
  googleDriveConnected: boolean;
}

export function useStorageProvider() {
  const [config, setConfig] = useLocalStorage<StorageConfig>('storage-config', {
    provider: 'local',
    googleDriveConnected: false
  });

  const switchToLocal = () => {
    setConfig(prev => ({ ...prev, provider: 'local' }));
  };

  const switchToGoogleDrive = () => {
    if (config.googleDriveConnected) {
      setConfig(prev => ({ ...prev, provider: 'google-drive' }));
    }
  };

  const connectGoogleDrive = async () => {
    // Google Drive API bağlantısı burada implement ediləcək
    // Hələlik sadəcə state-i update edirik
    setConfig(prev => ({ 
      ...prev, 
      googleDriveConnected: true,
      provider: 'google-drive'
    }));
  };

  const disconnectGoogleDrive = () => {
    setConfig({
      provider: 'local',
      googleDriveConnected: false
    });
  };

  return {
    config,
    switchToLocal,
    switchToGoogleDrive,
    connectGoogleDrive,
    disconnectGoogleDrive
  };
}