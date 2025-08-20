// Enterprise environment configuration
export const ENV_CONFIG = {
  isDevelopment: import.meta.env.DEV,
  isProduction: import.meta.env.PROD,
  isTest: import.meta.env.MODE === 'test',
  
  // Application settings
  app: {
    name: import.meta.env.VITE_APP_NAME || 'Inventory Management System',
    version: import.meta.env.VITE_APP_VERSION || '1.0.0',
    build: import.meta.env.VITE_BUILD_NUMBER || Date.now().toString(),
  },
  
  // Feature flags
  features: {
    enableAnalytics: import.meta.env.VITE_ENABLE_ANALYTICS === 'true',
    enableErrorReporting: import.meta.env.VITE_ENABLE_ERROR_REPORTING === 'true',
    enablePerformanceMonitoring: import.meta.env.VITE_ENABLE_PERFORMANCE === 'true',
    enableOfflineMode: import.meta.env.VITE_ENABLE_OFFLINE !== 'false',
    enablePWA: import.meta.env.VITE_ENABLE_PWA !== 'false',
  },
  
  // API configuration
  api: {
    baseUrl: import.meta.env.VITE_API_BASE_URL || '',
    timeout: parseInt(import.meta.env.VITE_API_TIMEOUT || '30000'),
    retryAttempts: parseInt(import.meta.env.VITE_API_RETRY_ATTEMPTS || '3'),
  },
  
  // Storage configuration
  storage: {
    keyPrefix: import.meta.env.VITE_STORAGE_PREFIX || 'inventory_app',
    encryptionEnabled: import.meta.env.VITE_STORAGE_ENCRYPTION !== 'false',
    compressionEnabled: import.meta.env.VITE_STORAGE_COMPRESSION !== 'false',
  },
  
  // Security settings
  security: {
    enableCSP: import.meta.env.VITE_ENABLE_CSP !== 'false',
    enableSRI: import.meta.env.VITE_ENABLE_SRI !== 'false',
    sessionTimeout: parseInt(import.meta.env.VITE_SESSION_TIMEOUT || '1800000'), // 30 min
  },
  
  // Performance settings
  performance: {
    chunkSize: parseInt(import.meta.env.VITE_CHUNK_SIZE || '1000'),
    maxCacheSize: parseInt(import.meta.env.VITE_MAX_CACHE_SIZE || '50'),
    backgroundSyncInterval: parseInt(import.meta.env.VITE_SYNC_INTERVAL || '300000'), // 5 min
  }
} as const;

// Type-safe environment access
export type EnvironmentConfig = typeof ENV_CONFIG;