import { ReactNode } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle, CheckCircle, Info } from "lucide-react";

interface ValidationError {
  field: string;
  message: string;
  type: 'error' | 'warning' | 'info';
}

interface FormValidationProps {
  errors: ValidationError[];
  className?: string;
}

export function FormValidation({ errors, className = "" }: FormValidationProps) {
  if (errors.length === 0) return null;

  return (
    <div className={`space-y-2 ${className}`}>
      {errors.map((error, index) => (
        <Alert 
          key={`validation-error-${error.field}-${error.message.slice(0, 10)}-${index}`}
          variant={error.type === 'error' ? 'destructive' : 'default'}
          className="text-sm"
        >
          {error.type === 'error' ? (
            <AlertTriangle className="h-4 w-4" />
          ) : error.type === 'warning' ? (
            <AlertTriangle className="h-4 w-4 text-warning" />
          ) : (
            <Info className="h-4 w-4" />
          )}
          <AlertDescription>
            <span className="font-medium">{error.field}:</span> {error.message}
          </AlertDescription>
        </Alert>
      ))}
    </div>
  );
}

interface FormFieldWrapperProps {
  children: ReactNode;
  error?: string;
  label?: string;
  required?: boolean;
}

export function FormFieldWrapper({ 
  children, 
  error, 
  label, 
  required = false 
}: FormFieldWrapperProps) {
  return (
    <div className="space-y-2">
      {label && (
        <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
          {label}
          {required && <span className="text-destructive ml-1">*</span>}
        </label>
      )}
      {children}
      {error && (
        <p className="text-sm text-destructive flex items-center gap-1">
          <AlertTriangle className="h-3 w-3" />
          {error}
        </p>
      )}
    </div>
  );
}

// Validation helper functions
export const validateRequired = (value: any, fieldName: string): ValidationError | null => {
  if (!value || (typeof value === 'string' && value.trim() === '')) {
    return {
      field: fieldName,
      message: 'Bu sahə mütləqdir',
      type: 'error'
    };
  }
  return null;
};

export const validatePositiveNumber = (value: number, fieldName: string): ValidationError | null => {
  if (isNaN(value) || value <= 0) {
    return {
      field: fieldName,
      message: 'Müsbət ədəd olmalıdır',
      type: 'error'
    };
  }
  return null;
};

export const validateArray = (array: any[], fieldName: string, minLength: number = 1): ValidationError | null => {
  if (!Array.isArray(array) || array.length < minLength) {
    return {
      field: fieldName,
      message: `Ən azı ${minLength} element olmalıdır`,
      type: 'error'
    };
  }
  return null;
};