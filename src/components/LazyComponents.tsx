import { lazy, Suspense } from "react";
import { LoadingSpinner } from "./LoadingSpinner";

// Lazy loaded components with proper error boundaries and loading states

// Product components
export const LazyProductDialog = lazy(() => import("./ProductDialog").then(module => ({ default: module.ProductDialog })));
export const LazyProductTable = lazy(() => import("./ProductTable").then(module => ({ default: module.ProductTable })));
export const LazyProductFilters = lazy(() => import("./ProductFilters").then(module => ({ default: module.ProductFilters })));
export const LazyExcelImport = lazy(() => import("./ExcelImport").then(module => ({ default: module.ExcelImport })));

// Report components
export const LazyEnhancedReports = lazy(() => import("./EnhancedReports").then(module => ({ default: module.EnhancedReports })));

// Utility components
export const LazyFormValidation = lazy(() => import("./FormValidation").then(module => ({ default: module.FormValidation })));
export const LazyMobileResponsiveTable = lazy(() => import("./MobileResponsiveTable").then(module => ({ default: module.MobileResponsiveTable })));
export const LazyOptimizedTable = lazy(() => import("./OptimizedTable").then(module => ({ default: module.OptimizedTable })));
export const LazyOptimizedList = lazy(() => import("./OptimizedList").then(module => ({ default: module.OptimizedList })));
export const LazyVirtualizedList = lazy(() => import("./VirtualizedList").then(module => ({ default: module.VirtualizedList })));

// Performance components  
export const LazyPerformanceMonitor = lazy(() => import("./PerformanceMonitor").then(module => ({ default: module.PerformanceOverlay })));
export const LazyAccessibilityChecker = lazy(() => import("./AccessibilityChecker").then(module => ({ default: module.AccessibilityOverlay })));

// Offline components
export const LazyOfflineManager = lazy(() => import("./OfflineManager").then(module => ({ default: module.OfflineManager })));

// Wrapper component for lazy loading with error handling
interface LazyWrapperProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  error?: React.ReactNode;
}

export function LazyWrapper({ 
  children, 
  fallback = <LoadingSpinner />,
  error = <div className="text-center p-4 text-destructive">Komponent yüklənmədi</div>
}: LazyWrapperProps) {
  return (
    <Suspense fallback={fallback}>
      {children}
    </Suspense>
  );
}

// Higher order component for creating lazy components
export function createLazyComponent<T extends React.ComponentType<any>>(
  importFunc: () => Promise<{ default: T }>,
  displayName?: string
) {
  const LazyComponent = lazy(importFunc);
  
  return function WrappedLazyComponent(props: React.ComponentProps<T>) {
    return (
      <LazyWrapper>
        <LazyComponent {...props} />
      </LazyWrapper>
    );
  };
}

// Preload functions for critical components
export const preloadProductComponents = () => {
  import("./ProductDialog");
  import("./ProductTable");
  import("./ProductFilters");
  import("./ExcelImport");
};

export const preloadReportComponents = () => {
  import("./EnhancedReports");
};

export const preloadUtilityComponents = () => {
  import("./FormValidation");
  import("./MobileResponsiveTable");
  import("./OptimizedTable");
};

// Component registry for dynamic loading
export const ComponentRegistry = {
  ProductDialog: LazyProductDialog,
  ProductTable: LazyProductTable,
  ProductFilters: LazyProductFilters,
  ExcelImport: LazyExcelImport,
  EnhancedReports: LazyEnhancedReports,
  FormValidation: LazyFormValidation,
  MobileResponsiveTable: LazyMobileResponsiveTable,
  OptimizedTable: LazyOptimizedTable,
  OptimizedList: LazyOptimizedList,
  VirtualizedList: LazyVirtualizedList,
  PerformanceMonitor: LazyPerformanceMonitor,
  AccessibilityChecker: LazyAccessibilityChecker,
  OfflineManager: LazyOfflineManager
} as const;

export type ComponentName = keyof typeof ComponentRegistry;