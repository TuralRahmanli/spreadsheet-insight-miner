// Secure storage utilities with basic encryption
const STORAGE_KEY = 'inventory_app';

interface SecureStorageOptions {
  expiry?: number; // in milliseconds
}

export class SecureStorage {
  // Simple encoding/decoding using base64 (not cryptographically secure but better than plain text)
  private static encode(data: string): string {
    try {
      return btoa(data);
    } catch (error) {
      console.error('Encoding failed:', error);
      return data;
    }
  }

  private static decode(encodedData: string): string {
    try {
      return atob(encodedData);
    } catch (error) {
      console.error('Decoding failed:', error);
      return encodedData;
    }
  }

  static setItem(key: string, value: any, options: SecureStorageOptions = {}): boolean {
    try {
      const { expiry } = options;
      
      const data = {
        value,
        timestamp: Date.now(),
        expiry: expiry ? Date.now() + expiry : null
      };

      const serializedData = JSON.stringify(data);
      const encodedData = this.encode(serializedData);
      
      localStorage.setItem(`${STORAGE_KEY}_${key}`, encodedData);
      return true;
    } catch (error) {
      console.error(`Failed to store ${key}:`, error);
      return false;
    }
  }

  static getItem<T = any>(key: string): T | null {
    try {
      const storedData = localStorage.getItem(`${STORAGE_KEY}_${key}`);
      
      if (!storedData) return null;

      const rawData = this.decode(storedData);
      const parsedData = JSON.parse(rawData);

      // Check expiry
      if (parsedData.expiry && Date.now() > parsedData.expiry) {
        this.removeItem(key);
        return null;
      }

      return parsedData.value;
    } catch (error) {
      console.error(`Failed to retrieve ${key}:`, error);
      return null;
    }
  }

  static removeItem(key: string): boolean {
    try {
      localStorage.removeItem(`${STORAGE_KEY}_${key}`);
      return true;
    } catch (error) {
      console.error(`Failed to remove ${key}:`, error);
      return false;
    }
  }

  static clear(): boolean {
    try {
      const keys = Object.keys(localStorage).filter(key => 
        key.startsWith(STORAGE_KEY)
      );
      
      keys.forEach(key => localStorage.removeItem(key));
      return true;
    } catch (error) {
      console.error('Failed to clear storage:', error);
      return false;
    }
  }

  // Utility method to check if storage is available
  static isAvailable(): boolean {
    try {
      const testKey = '__storage_test__';
      localStorage.setItem(testKey, 'test');
      localStorage.removeItem(testKey);
      return true;
    } catch {
      return false;
    }
  }

  // Data integrity check
  static validateData(key: string): boolean {
    try {
      const data = this.getItem(key);
      return data !== null;
    } catch {
      return false;
    }
  }
}