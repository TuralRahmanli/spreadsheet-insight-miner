import { useCallback } from "react";
import { toast } from "@/hooks/use-toast";

export const useErrorHandler = () => {
  const handleError = useCallback((error: unknown, context?: string) => {
    // Error handling logic here
    let message = "Gözlənilməz xəta baş verdi";
    
    if (error instanceof Error) {
      message = error.message;
    } else if (typeof error === "string") {
      message = error;
    }

    toast({
      variant: "destructive",
      title: "Xəta",
      description: message,
      duration: 5000,
    });
  }, []);

  const handleAsyncError = useCallback(async <T>(
    asyncFn: () => Promise<T>,
    context?: string
  ): Promise<T | null> => {
    try {
      return await asyncFn();
    } catch (error) {
      handleError(error, context);
      return null;
    }
  }, [handleError]);

  return { handleError, handleAsyncError };
};