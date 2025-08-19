// Type guards and utilities for better TypeScript support

import { Product } from "@/types";

// Type guards
export function isString(value: unknown): value is string {
  return typeof value === 'string';
}

export function isNumber(value: unknown): value is number {
  return typeof value === 'number' && !isNaN(value);
}

export function isBoolean(value: unknown): value is boolean {
  return typeof value === 'boolean';
}

export function isArray<T>(value: unknown): value is T[] {
  return Array.isArray(value);
}

export function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function isDefined<T>(value: T | undefined | null): value is T {
  return value !== undefined && value !== null;
}

export function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

export function isValidProduct(value: unknown): value is Product {
  return isObject(value) &&
    isString(value.id) &&
    isString(value.article) &&
    isString(value.name) &&
    isString(value.category) &&
    isString(value.status) &&
    isNumber(value.stock) &&
    isString(value.unit) &&
    isArray(value.packaging) &&
    isArray(value.warehouses);
}

export function isValidEmail(value: unknown): value is string {
  if (!isString(value)) return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(value);
}

export function isValidDate(value: unknown): value is Date {
  return value instanceof Date && !isNaN(value.getTime());
}

// Utility functions with proper typing
export function assertIsString(value: unknown, errorMessage?: string): asserts value is string {
  if (!isString(value)) {
    throw new Error(errorMessage || 'Expected string value');
  }
}

export function assertIsNumber(value: unknown, errorMessage?: string): asserts value is number {
  if (!isNumber(value)) {
    throw new Error(errorMessage || 'Expected number value');
  }
}

export function assertIsArray<T>(value: unknown, errorMessage?: string): asserts value is T[] {
  if (!isArray(value)) {
    throw new Error(errorMessage || 'Expected array value');
  }
}

// Safe converters
export function safeParseInt(value: unknown, defaultValue: number = 0): number {
  if (isNumber(value)) return Math.floor(value);
  if (isString(value)) {
    const parsed = parseInt(value, 10);
    return isNaN(parsed) ? defaultValue : parsed;
  }
  return defaultValue;
}

export function safeParseFloat(value: unknown, defaultValue: number = 0): number {
  if (isNumber(value)) return value;
  if (isString(value)) {
    const parsed = parseFloat(value);
    return isNaN(parsed) ? defaultValue : parsed;
  }
  return defaultValue;
}

export function safeStringify(value: unknown): string {
  if (isString(value)) return value;
  if (value === null || value === undefined) return '';
  if (typeof value === 'object') {
    try {
      return JSON.stringify(value);
    } catch {
      return '[Object]';
    }
  }
  return String(value);
}

// Array utilities with proper typing
export function filterDefined<T>(array: (T | undefined | null)[]): T[] {
  return array.filter(isDefined);
}

export function uniqueBy<T, K extends keyof T>(array: T[], key: K): T[] {
  const seen = new Set();
  return array.filter(item => {
    const value = item[key];
    if (seen.has(value)) {
      return false;
    }
    seen.add(value);
    return true;
  });
}

export function groupBy<T, K extends keyof T>(array: T[], key: K): Record<string, T[]> {
  return array.reduce((groups, item) => {
    const groupKey = String(item[key]);
    if (!groups[groupKey]) {
      groups[groupKey] = [];
    }
    groups[groupKey].push(item);
    return groups;
  }, {} as Record<string, T[]>);
}

// Object utilities
export function pickProperties<T, K extends keyof T>(obj: T, keys: K[]): Pick<T, K> {
  const result = {} as Pick<T, K>;
  keys.forEach(key => {
    if (key in obj) {
      result[key] = obj[key];
    }
  });
  return result;
}

export function omitProperties<T extends Record<string, any>, K extends keyof T>(obj: T, keys: K[]): Omit<T, K> {
  const result = { ...obj };
  keys.forEach(key => {
    delete result[key];
  });
  return result;
}

// Validation helpers
export interface ValidationResult<T> {
  success: boolean;
  data?: T;
  errors: string[];
}

export function createValidator<T>(
  validationFn: (value: unknown) => value is T,
  errorMessage: string = 'Validation failed'
) {
  return (value: unknown): ValidationResult<T> => {
    if (validationFn(value)) {
      return { success: true, data: value, errors: [] };
    } else {
      return { success: false, errors: [errorMessage] };
    }
  };
}

export const stringValidator = createValidator(isString, 'Dəyər string olmalıdır');
export const numberValidator = createValidator(isNumber, 'Dəyər rəqəm olmalıdır');
export const emailValidator = createValidator(isValidEmail, 'Düzgün email ünvanı daxil edin');
export const productValidator = createValidator(isValidProduct, 'Düzgün məhsul məlumatları daxil edin');