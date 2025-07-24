// Capacitor və native API type definitions
export interface AppUrlOpenData {
  url: string;
  iosSourceApplication?: string;
  iosOpenInPlace?: boolean;
}

export interface AppStateChangeData {
  isActive: boolean;
}

export interface OfflineAction {
  type: string;
  data: Record<string, unknown>;
  timestamp: number;
  id: string;
  status: 'pending' | 'completed' | 'failed';
}

export interface QueuedAction extends OfflineAction {
  type: 'ADD_PRODUCT' | 'UPDATE_PRODUCT' | 'DELETE_PRODUCT' | 'ADD_WAREHOUSE' | 'UPDATE_WAREHOUSE' | 'DELETE_WAREHOUSE' | 'ADD_OPERATION';
}

export interface ServiceWorkerRegistrationWithSync extends ServiceWorkerRegistration {
  sync: {
    register: (tag: string) => Promise<void>;
  };
}

export interface AppSettings {
  companyName: string;
  language: string;
  autoBackup: boolean;
  notifications: boolean;
  darkMode: boolean;
}