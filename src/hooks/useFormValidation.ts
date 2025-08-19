import { useState, useCallback } from 'react';
import { toast } from '@/hooks/use-toast';

interface ValidationRule {
  field: string;
  validate: (value: any, formData?: any) => string | null;
  required?: boolean;
}

interface ValidationError {
  field: string;
  message: string;
}

export const useFormValidation = (rules: ValidationRule[]) => {
  const [errors, setErrors] = useState<ValidationError[]>([]);
  const [isValidating, setIsValidating] = useState(false);

  const validateField = useCallback((field: string, value: any, formData?: any): string | null => {
    const rule = rules.find(r => r.field === field);
    if (!rule) return null;

    // Check required
    if (rule.required && (!value || (typeof value === 'string' && value.trim() === ''))) {
      return 'Bu sahə mütləqdir';
    }

    // Run custom validation
    if (value !== undefined && value !== null && value !== '') {
      return rule.validate(value, formData);
    }

    return null;
  }, [rules]);

  const validateForm = useCallback((formData: Record<string, any>): boolean => {
    setIsValidating(true);
    const newErrors: ValidationError[] = [];

    rules.forEach(rule => {
      const error = validateField(rule.field, formData[rule.field], formData);
      if (error) {
        newErrors.push({
          field: rule.field,
          message: error
        });
      }
    });

    setErrors(newErrors);
    setIsValidating(false);

    if (newErrors.length > 0) {
      toast({
        title: "Form xətaları",
        description: `${newErrors.length} sahədə xəta var`,
        variant: "destructive",
      });
      return false;
    }

    return true;
  }, [rules, validateField]);

  const clearErrors = useCallback(() => {
    setErrors([]);
  }, []);

  const clearFieldError = useCallback((field: string) => {
    setErrors(prev => prev.filter(e => e.field !== field));
  }, []);

  const getFieldError = useCallback((field: string): string | undefined => {
    return errors.find(e => e.field === field)?.message;
  }, [errors]);

  const hasErrors = errors.length > 0;

  return {
    errors,
    isValidating,
    validateField,
    validateForm,
    clearErrors,
    clearFieldError,
    getFieldError,
    hasErrors
  };
};

// Common validation rules
export const commonValidationRules = {
  required: (value: any) => !value || (typeof value === 'string' && value.trim() === '') ? 'Bu sahə mütləqdir' : null,
  
  positiveNumber: (value: number) => {
    if (isNaN(value) || value <= 0) return 'Müsbət ədəd olmalıdır';
    return null;
  },
  
  nonEmptyArray: (value: any[]) => {
    if (!Array.isArray(value) || value.length === 0) return 'Ən azı bir element seçin';
    return null;
  },
  
  email: (value: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) return 'Düzgün email ünvanı daxil edin';
    return null;
  },
  
  minLength: (min: number) => (value: string) => {
    if (value.length < min) return `Ən azı ${min} simvol olmalıdır`;
    return null;
  },
  
  maxLength: (max: number) => (value: string) => {
    if (value.length > max) return `Maksimum ${max} simvol ola bilər`;
    return null;
  }
};