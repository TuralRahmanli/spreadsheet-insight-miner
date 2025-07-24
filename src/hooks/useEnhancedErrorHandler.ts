// Enhanced error handling utilities
import { useCallback } from 'react';
import { toast } from '@/hooks/use-toast';

export interface ErrorDetails {
  code?: string;
  context?: string;
  userMessage?: string;
  technical?: string;
}

export interface AsyncErrorResult<T> {
  success: boolean;
  data?: T;
  error?: Error;
}

export const useEnhancedErrorHandler = () => {
  const handleError = useCallback((error: unknown, details?: ErrorDetails) => {
    const { context = 'Unknown', userMessage, technical } = details || {};
    
    let errorMessage = userMessage || 'Gözlənilməz xəta baş verdi';
    let technicalDetails = technical;

    if (error instanceof Error) {
      technicalDetails = technical || error.message;
      if (error.name === 'NetworkError') {
        errorMessage = 'Şəbəkə bağlantısı problemi. İnternet bağlantınızı yoxlayın.';
      } else if (error.name === 'ValidationError') {
        errorMessage = 'Məlumat doğrulama xətası. Daxil etdiyiniz məlumatları yoxlayın.';
      } else if (error.message.includes('localStorage')) {
        errorMessage = 'Məlumat saxlama problemi. Brauzerin local storage icazəsini yoxlayın.';
      }
    } else if (typeof error === 'string') {
      technicalDetails = error;
    } else {
      technicalDetails = 'Unknown error type';
    }

    // Log for debugging (only in development)
    if (process.env.NODE_ENV === 'development' && import.meta.env.DEV) {
      console.group(`🚨 Error in ${context}`);
      console.error('Original error:', error);
      console.error('Technical details:', technicalDetails);
      console.error('User message:', errorMessage);
      console.groupEnd();
    }

    // Show user-friendly toast
    toast({
      title: "Xəta",
      description: errorMessage,
      variant: "destructive"
    });

    // Return structured error info
    return {
      originalError: error,
      userMessage: errorMessage,
      technicalDetails,
      context,
      timestamp: new Date().toISOString()
    };
  }, []);

  const handleAsyncError = useCallback(async <T>(
    asyncFn: () => Promise<T>,
    details?: ErrorDetails
  ): Promise<AsyncErrorResult<T>> => {
    try {
      const data = await asyncFn();
      return { success: true, data };
    } catch (error) {
      const errorInfo = handleError(error, details);
      return { 
        success: false, 
        error: error instanceof Error ? error : new Error('Unknown error')
      };
    }
  }, [handleError]);

  const validateAndExecute = useCallback(async <T>(
    data: unknown,
    validator: (data: unknown) => data is T,
    asyncFn: (validData: T) => Promise<unknown>,
    details?: ErrorDetails
  ): Promise<AsyncErrorResult<unknown>> => {
    try {
      if (!validator(data)) {
        throw new Error('Validation failed: Invalid data format');
      }
      
      const result = await asyncFn(data);
      return { success: true, data: result };
    } catch (error) {
      return handleAsyncError(() => Promise.reject(error), {
        ...details,
        context: `${details?.context || 'Validation'} - Data validation failed`
      });
    }
  }, [handleAsyncError]);

  return { 
    handleError, 
    handleAsyncError, 
    validateAndExecute 
  };
};