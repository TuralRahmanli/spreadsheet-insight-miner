// Centralized error handling utilities

export class AppError extends Error {
  constructor(
    message: string,
    public code: string,
    public isUserFacing: boolean = true,
    public originalError?: Error
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export const ErrorCodes = {
  STORAGE_ERROR: 'STORAGE_ERROR',
  NETWORK_ERROR: 'NETWORK_ERROR', 
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  BLUETOOTH_ERROR: 'BLUETOOTH_ERROR',
  FILE_PROCESSING_ERROR: 'FILE_PROCESSING_ERROR',
  PERMISSION_ERROR: 'PERMISSION_ERROR',
} as const;

export type ErrorCode = typeof ErrorCodes[keyof typeof ErrorCodes];

export function createError(
  message: string,
  code: ErrorCode,
  isUserFacing: boolean = true,
  originalError?: Error
): AppError {
  return new AppError(message, code, isUserFacing, originalError);
}

export function handleStorageError(error: unknown): AppError {
  const message = error instanceof Error ? error.message : 'Storage xətası baş verdi';
  return createError(
    'Məlumatlar saxlanılarkən xəta baş verdi',
    ErrorCodes.STORAGE_ERROR,
    true,
    error instanceof Error ? error : undefined
  );
}

export function handleNetworkError(error: unknown): AppError {
  const message = error instanceof Error ? error.message : 'Şəbəkə xətası baş verdi';
  return createError(
    'Şəbəkə bağlantısında problem var',
    ErrorCodes.NETWORK_ERROR,
    true,
    error instanceof Error ? error : undefined
  );
}

export function handleValidationError(field: string, value: unknown): AppError {
  return createError(
    `${field} sahəsində yanlış məlumat: ${String(value)}`,
    ErrorCodes.VALIDATION_ERROR,
    true
  );
}

export function isAppError(error: unknown): error is AppError {
  return error instanceof AppError;
}

export function getErrorMessage(error: unknown): string {
  if (isAppError(error)) {
    return error.message;
  }
  
  if (error instanceof Error) {
    return error.message;
  }
  
  return 'Bilinməyən xəta baş verdi';
}

// Safe JSON parsing
export function safeJSONParse<T>(json: string, fallback: T): T {
  try {
    const parsed = JSON.parse(json);
    return parsed;
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.warn('JSON parse failed:', error);
    }
    return fallback;
  }
}

// Safe localStorage operations
export const safeStorage = {
  getItem<T>(key: string, fallback: T): T {
    try {
      const item = localStorage.getItem(key);
      if (item === null) return fallback;
      return safeJSONParse(item, fallback);
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.warn(`Failed to get ${key} from localStorage:`, error);
      }
      return fallback;
    }
  },

  setItem<T>(key: string, value: T): boolean {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.warn(`Failed to set ${key} in localStorage:`, error);
      }
      return false;
    }
  },

  removeItem(key: string): boolean {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.warn(`Failed to remove ${key} from localStorage:`, error);
      }
      return false;
    }
  }
};