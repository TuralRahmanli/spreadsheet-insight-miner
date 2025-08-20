// Enterprise-grade validation hooks with comprehensive error handling
import { useCallback, useMemo } from 'react';
import { 
  isValidProduct, 
  isValidWarehouse, 
  isValidOperation,
  isValidExcelFile,
  validateApiResponse,
  isNonEmptyString,
  isPositiveNumber,
  isValidJSON
} from '@/utils/typeGuards';
import { log } from '@/utils/logger';
import type { Product, Warehouse, Operation } from '@/types';

interface ValidationResult<T> {
  isValid: boolean;
  data?: T;
  errors: string[];
  warnings: string[];
}

interface BatchValidationResult<T> {
  validItems: T[];
  invalidItems: Array<{ item: unknown; errors: string[] }>;
  totalCount: number;
  validCount: number;
  invalidCount: number;
  warnings: string[];
}

export const useEnterpriseValidation = () => {
  // Single item validation with detailed error reporting
  const validateProduct = useCallback((data: unknown): ValidationResult<Product> => {
    const result: ValidationResult<Product> = {
      isValid: false,
      errors: [],
      warnings: []
    };

    try {
      if (!data || typeof data !== 'object') {
        result.errors.push('Məhsul məlumatları mövcud deyil və ya düzgün formatda deyil');
        return result;
      }

      if (isValidProduct(data)) {
        result.isValid = true;
        result.data = data;

        // Add warnings for potential issues
        if (data.stock === 0) {
          result.warnings.push('Məhsul stokda mövcud deyil');
        } else if (data.stock < 10) {
          result.warnings.push('Məhsul stoku azdır');
        }

        if (!data.description?.trim()) {
          result.warnings.push('Məhsul təsviri yoxdur');
        }

        if (data.warehouses.length === 0) {
          result.warnings.push('Heç bir anbara təyin edilməyib');
        }
      } else {
        // Detailed validation errors
        const item = data as Record<string, unknown>;
        
        if (!item.id || !isNonEmptyString(item.id)) {
          result.errors.push('Məhsul ID-si tələb olunur');
        }
        
        if (!item.name || !isNonEmptyString(item.name)) {
          result.errors.push('Məhsul adı tələb olunur');
        }
        
        if (!item.stock || !isPositiveNumber(item.stock)) {
          result.errors.push('Məhsul stoku düzgün rəqəm olmalıdır');
        }
        
        if (!item.category || !isNonEmptyString(item.category)) {
          result.errors.push('Məhsul kateqoriyası tələb olunur');
        }
      }
    } catch (error) {
      log.error('Product validation failed', 'EnterpriseValidation', { error, data });
      result.errors.push('Məhsul doğrulama zamanı xəta baş verdi');
    }

    return result;
  }, []);

  const validateWarehouse = useCallback((data: unknown): ValidationResult<Warehouse> => {
    const result: ValidationResult<Warehouse> = {
      isValid: false,
      errors: [],
      warnings: []
    };

    try {
      if (!data || typeof data !== 'object') {
        result.errors.push('Anbar məlumatları mövcud deyil və ya düzgün formatda deyil');
        return result;
      }

      if (isValidWarehouse(data)) {
        result.isValid = true;
        result.data = data;

        // Add warnings (assuming stock property exists)
        const currentStock = (data as any).currentStock || 0;
        const utilizationRatio = currentStock / data.capacity;
        if (utilizationRatio > 0.9) {
          result.warnings.push('Anbar dolmaq üzrədir (90%+)');
        } else if (utilizationRatio > 0.8) {
          result.warnings.push('Anbar dolmağa yaxındır (80%+)');
        }

        if (!data.description?.trim()) {
          result.warnings.push('Anbar təsviri yoxdur');
        }
      } else {
        // Detailed validation errors
        const item = data as Record<string, unknown>;
        
        if (!item.id || !isNonEmptyString(item.id)) {
          result.errors.push('Anbar ID-si tələb olunur');
        }
        
        if (!item.name || !isNonEmptyString(item.name)) {
          result.errors.push('Anbar adı tələb olunur');
        }
        
        if (!item.capacity || !isPositiveNumber(item.capacity)) {
          result.errors.push('Anbar tutumu düzgün rəqəm olmalıdır');
        }
      }
    } catch (error) {
      log.error('Warehouse validation failed', 'EnterpriseValidation', { error, data });
      result.errors.push('Anbar doğrulama zamanı xəta baş verdi');
    }

    return result;
  }, []);

  const validateOperation = useCallback((data: unknown): ValidationResult<Operation> => {
    const result: ValidationResult<Operation> = {
      isValid: false,
      errors: [],
      warnings: []
    };

    try {
      if (!data || typeof data !== 'object') {
        result.errors.push('Əməliyyat məlumatları mövcud deyil və ya düzgün formatda deyil');
        return result;
      }

      if (isValidOperation(data)) {
        result.isValid = true;
        result.data = data;

        // Add warnings
        if (data.quantity > 1000) {
          result.warnings.push('Böyük miqdar əməliyyatı - diqqətli olun');
        }

        const operationDate = new Date(data.date);
        const now = new Date();
        const daysDiff = (now.getTime() - operationDate.getTime()) / (1000 * 60 * 60 * 24);
        
        if (daysDiff > 30) {
          result.warnings.push('Köhnə tarixli əməliyyat');
        }
      } else {
        // Detailed validation errors
        const item = data as Record<string, unknown>;
        
        if (!item.type || !['giriş', 'çıxış'].includes(item.type as string)) {
          result.errors.push('Əməliyyat növü "giriş" və ya "çıxış" olmalıdır');
        }
        
        if (!item.quantity || !isPositiveNumber(item.quantity)) {
          result.errors.push('Əməliyyat miqdarı müsbət rəqəm olmalıdır');
        }
        
        if (!item.productId || !isNonEmptyString(item.productId)) {
          result.errors.push('Məhsul ID-si tələb olunur');
        }
      }
    } catch (error) {
      log.error('Operation validation failed', 'EnterpriseValidation', { error, data });
      result.errors.push('Əməliyyat doğrulama zamanı xəta baş verdi');
    }

    return result;
  }, []);

  // Batch validation for bulk operations
  const validateProductBatch = useCallback((items: unknown[]): BatchValidationResult<Product> => {
    const result: BatchValidationResult<Product> = {
      validItems: [],
      invalidItems: [],
      totalCount: items.length,
      validCount: 0,
      invalidCount: 0,
      warnings: []
    };

    try {
      items.forEach((item, index) => {
        const validation = validateProduct(item);
        
        if (validation.isValid && validation.data) {
          result.validItems.push(validation.data);
          result.validCount++;
          result.warnings.push(...validation.warnings.map(w => `Sıra ${index + 1}: ${w}`));
        } else {
          result.invalidItems.push({
            item,
            errors: validation.errors
          });
          result.invalidCount++;
        }
      });

      // Add batch-level warnings
      if (result.invalidCount > result.validCount * 0.5) {
        result.warnings.push('Məlumatların yarısından çoxu etibarsızdır - məlumat mənbəyini yoxlayın');
      }
    } catch (error) {
      log.error('Batch product validation failed', 'EnterpriseValidation', { error });
      result.warnings.push('Toplu doğrulama zamanı xəta baş verdi');
    }

    return result;
  }, [validateProduct]);

  // File validation
  const validateFile = useCallback((file: File): ValidationResult<File> => {
    const result: ValidationResult<File> = {
      isValid: false,
      errors: [],
      warnings: []
    };

    try {
      if (!isValidExcelFile(file)) {
        result.errors.push('Yalnız Excel faylları (.xlsx, .xls, .csv) qəbul edilir');
        return result;
      }

      const maxSize = 10 * 1024 * 1024; // 10MB
      if (file.size > maxSize) {
        result.errors.push('Fayl ölçüsü 10MB-dan böyük ola bilməz');
        return result;
      }

      if (file.size === 0) {
        result.errors.push('Fayl boşdur');
        return result;
      }

      result.isValid = true;
      result.data = file;

      // Warnings
      if (file.size > 5 * 1024 * 1024) {
        result.warnings.push('Böyük fayl - işləmə vaxtı uzun ola bilər');
      }

      if (file.name.includes(' ')) {
        result.warnings.push('Fayl adında boşluq var - adlandırma standartlarına uyğun deyil');
      }
    } catch (error) {
      log.error('File validation failed', 'EnterpriseValidation', { error, fileName: file.name });
      result.errors.push('Fayl doğrulama zamanı xəta baş verdi');
    }

    return result;
  }, []);

  // JSON validation
  const validateJSON = useCallback((jsonString: string): ValidationResult<unknown> => {
    const result: ValidationResult<unknown> = {
      isValid: false,
      errors: [],
      warnings: []
    };

    try {
      if (!isValidJSON(jsonString)) {
        result.errors.push('Etibarsız JSON formatı');
        return result;
      }

      const parsed = JSON.parse(jsonString);
      result.isValid = true;
      result.data = parsed;

      // Check for common issues
      if (JSON.stringify(parsed).length > 1024 * 1024) {
        result.warnings.push('Böyük JSON məlumatı - performans problemləri ola bilər');
      }
    } catch (error) {
      log.error('JSON validation failed', 'EnterpriseValidation', { error });
      result.errors.push('JSON doğrulama zamanı xəta baş verdi');
    }

    return result;
  }, []);

  // API response validation
  const validateApiResponse = useCallback(<T>(
    response: unknown,
    validator: (value: unknown) => value is T
  ): ValidationResult<T> => {
    const result: ValidationResult<T> = {
      isValid: false,
      errors: [],
      warnings: []
    };

    try {
      if (validator(response)) {
        result.isValid = true;
        result.data = response;
      } else {
        result.errors.push('API response format is invalid');
      }
    } catch (error) {
      log.error('API response validation failed', 'EnterpriseValidation', { error });
      result.errors.push('API cavab doğrulaması uğursuz oldu');
    }

    return result;
  }, []);

  // Memoized validation summary
  const validationStats = useMemo(() => ({
    getValidationSummary: (results: ValidationResult<unknown>[]): {
      totalValidated: number;
      validCount: number;
      invalidCount: number;
      warningCount: number;
      errorCount: number;
    } => {
      return results.reduce(
        (acc, result) => ({
          totalValidated: acc.totalValidated + 1,
          validCount: acc.validCount + (result.isValid ? 1 : 0),
          invalidCount: acc.invalidCount + (result.isValid ? 0 : 1),
          warningCount: acc.warningCount + result.warnings.length,
          errorCount: acc.errorCount + result.errors.length,
        }),
        { totalValidated: 0, validCount: 0, invalidCount: 0, warningCount: 0, errorCount: 0 }
      );
    }
  }), []);

  return {
    validateProduct,
    validateWarehouse,
    validateOperation,
    validateProductBatch,
    validateFile,
    validateJSON,
    validateApiResponse,
    validationStats
  };
};