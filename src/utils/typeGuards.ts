// Enterprise-grade type guards and validation utilities
import type { Product, Warehouse, Operation } from '@/types';

// Utility type for making all properties required and non-null
type RequiredNonNull<T> = {
  [P in keyof T]-?: NonNullable<T[P]>;
};

// Base validation functions
export const isString = (value: unknown): value is string => {
  return typeof value === 'string';
};

export const isNumber = (value: unknown): value is number => {
  return typeof value === 'number' && !isNaN(value) && isFinite(value);
};

export const isPositiveNumber = (value: unknown): value is number => {
  return isNumber(value) && value > 0;
};

export const isNonNegativeNumber = (value: unknown): value is number => {
  return isNumber(value) && value >= 0;
};

export const isInteger = (value: unknown): value is number => {
  return isNumber(value) && Number.isInteger(value);
};

export const isBoolean = (value: unknown): value is boolean => {
  return typeof value === 'boolean';
};

export const isArray = <T>(value: unknown, itemGuard?: (item: unknown) => item is T): value is T[] => {
  if (!Array.isArray(value)) return false;
  if (!itemGuard) return true;
  return value.every(itemGuard);
};

export const isObject = (value: unknown): value is Record<string, unknown> => {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
};

export const hasProperty = <T extends PropertyKey>(
  obj: unknown,
  prop: T
): obj is Record<T, unknown> => {
  return isObject(obj) && prop in obj;
};

export const isNonEmptyString = (value: unknown): value is string => {
  return isString(value) && value.trim().length > 0;
};

export const isValidDate = (value: unknown): value is Date => {
  return value instanceof Date && !isNaN(value.getTime());
};

export const isDateString = (value: unknown): value is string => {
  return isString(value) && !isNaN(Date.parse(value));
};

// Product validation
export const isValidProductStatus = (value: unknown): value is Product['status'] => {
  return isString(value) && ['active', 'inactive', 'low_stock', 'out_of_stock'].includes(value);
};

export const isValidUnit = (value: unknown): value is Product['unit'] => {
  return isString(value) && ['kg', 'litr', 'ədəd', 'metr', 'qutu'].includes(value);
};

export const isValidPackaging = (value: unknown): value is Product['packaging'] => {
  if (!isArray(value)) return false;
  
  return value.every(item => 
    isObject(item) &&
    hasProperty(item, 'type') &&
    hasProperty(item, 'quantity') &&
    isNonEmptyString(item.type) &&
    isNonNegativeNumber(item.quantity)
  );
};

export const isValidProduct = (value: unknown): value is Product => {
  if (!isObject(value)) return false;
  
  return (
    hasProperty(value, 'id') && isNonEmptyString(value.id) &&
    hasProperty(value, 'article') && isNonEmptyString(value.article) &&
    hasProperty(value, 'name') && isNonEmptyString(value.name) &&
    hasProperty(value, 'category') && isNonEmptyString(value.category) &&
    hasProperty(value, 'status') && isValidProductStatus(value.status) &&
    hasProperty(value, 'stock') && isNonNegativeNumber(value.stock) &&
    hasProperty(value, 'unit') && isValidUnit(value.unit) &&
    hasProperty(value, 'packaging') && isValidPackaging(value.packaging) &&
    hasProperty(value, 'warehouses') && isArray(value.warehouses, isNonEmptyString) &&
    (!hasProperty(value, 'description') || value.description === undefined || isString(value.description))
  );
};

// Warehouse validation
export const isValidWarehouse = (value: unknown): value is Warehouse => {
  if (!isObject(value)) return false;
  
  return (
    hasProperty(value, 'id') && isNonEmptyString(value.id) &&
    hasProperty(value, 'name') && isNonEmptyString(value.name) &&
    hasProperty(value, 'location') && isNonEmptyString(value.location) &&
    hasProperty(value, 'capacity') && isPositiveNumber(value.capacity) &&
    hasProperty(value, 'currentStock') && isNonNegativeNumber(value.currentStock) &&
    (!hasProperty(value, 'description') || value.description === undefined || isString(value.description))
  );
};

// Operation validation
export const isValidOperationType = (value: unknown): value is Operation['type'] => {
  return isString(value) && ['giriş', 'çıxış'].includes(value);
};

export const isValidOperation = (value: unknown): value is Operation => {
  if (!isObject(value)) return false;
  
  return (
    hasProperty(value, 'id') && isNonEmptyString(value.id) &&
    hasProperty(value, 'type') && isValidOperationType(value.type) &&
    hasProperty(value, 'productId') && isNonEmptyString(value.productId) &&
    hasProperty(value, 'productName') && isNonEmptyString(value.productName) &&
    hasProperty(value, 'warehouseName') && isNonEmptyString(value.warehouseName) &&
    hasProperty(value, 'quantity') && isPositiveNumber(value.quantity) &&
    hasProperty(value, 'date') && (isDateString(value.date) || isValidDate(value.date)) &&
    (!hasProperty(value, 'notes') || value.notes === undefined || isString(value.notes))
  );
};

// File validation
export const isValidFile = (value: unknown): value is File => {
  return value instanceof File;
};

export const isValidExcelFile = (file: unknown): file is File => {
  if (!isValidFile(file)) return false;
  
  const validTypes = [
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-excel',
    'text/csv'
  ];
  
  return validTypes.includes(file.type) || file.name.match(/\.(xlsx|xls|csv)$/i) !== null;
};

// Generic array validation with type narrowing
export const isValidArrayOf = <T>(
  value: unknown,
  itemValidator: (item: unknown) => item is T,
  minLength: number = 0,
  maxLength: number = Infinity
): value is T[] => {
  if (!isArray(value)) return false;
  if (value.length < minLength || value.length > maxLength) return false;
  return value.every(itemValidator);
};

// Configuration validation
export const isValidConfiguration = (value: unknown): value is Record<string, unknown> => {
  if (!isObject(value)) return false;
  
  // Check for required configuration properties
  const requiredKeys = ['version', 'environment'];
  return requiredKeys.every(key => hasProperty(value, key));
};

// JSON validation
export const isValidJSON = (value: string): boolean => {
  try {
    JSON.parse(value);
    return true;
  } catch {
    return false;
  }
};

// Safe type assertion with validation
export const assertType = <T>(
  value: unknown,
  validator: (value: unknown) => value is T,
  errorMessage?: string
): T => {
  if (validator(value)) {
    return value;
  }
  throw new Error(errorMessage || `Type assertion failed for value: ${String(value)}`);
};

// Utility for exhaustive checking in switch statements
export const assertNever = (value: never): never => {
  throw new Error(`Unexpected value: ${String(value)}`);
};

// Runtime type checking for API responses
export const validateApiResponse = <T>(
  response: unknown,
  validator: (value: unknown) => value is T
): { success: true; data: T } | { success: false; error: string } => {
  try {
    if (validator(response)) {
      return { success: true, data: response };
    }
    return { success: false, error: 'Invalid response format' };
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Validation error' 
    };
  }
};

// Collection validation utilities
export const isUniqueArray = <T>(
  array: T[],
  keyExtractor?: (item: T) => string | number
): boolean => {
  if (keyExtractor) {
    const keys = array.map(keyExtractor);
    return keys.length === new Set(keys).size;
  }
  return array.length === new Set(array).size;
};

export const hasNoDuplicates = <T extends { id: string }>(items: T[]): boolean => {
  return isUniqueArray(items, item => item.id);
};