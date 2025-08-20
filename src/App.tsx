import { Suspense, lazy, useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "./components/ThemeProvider";
import { EnhancedErrorBoundary } from "./components/EnhancedErrorBoundary";
import { EnterpriseLayout } from "./components/enterprise/EnterpriseLayout";
import { LoadingSpinner } from "./components/LoadingSpinner";
import { useAppIntents } from "./hooks/useAppIntents";
import { ENV_CONFIG } from "./config/environment";
import { log } from "./utils/logger";
import { monitoring } from "./utils/enterpriseMonitoring";

// Lazy load pages for better performance
const Index = lazy(() => import("./pages/Index"));
const ProductsList = lazy(() => import("./pages/ProductsList"));
const Reports = lazy(() => import("./pages/Reports"));

const AddOperation = lazy(() => import("./pages/AddOperation"));
const WarehousesList = lazy(() => import("./pages/WarehousesList"));
const Settings = lazy(() => import("./pages/Settings"));
const NotFound = lazy(() => import("./pages/NotFound"));

// Enterprise-ready query client configuration
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: ENV_CONFIG.api.retryAttempts,
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes
    },
    mutations: {
      retry: 1,
    },
  },
});

const AppContent = () => {
  // Initialize app intents handling for file associations
  useAppIntents();

  // Initialize enterprise monitoring
  useEffect(() => {
    if (ENV_CONFIG.features.enablePerformanceMonitoring) {
      monitoring.start();
      log.info('Enterprise application initialized', 'App', {
        version: ENV_CONFIG.app.version,
        environment: ENV_CONFIG.isDevelopment ? 'development' : 'production',
        features: ENV_CONFIG.features
      });
    }

    return () => {
      if (ENV_CONFIG.features.enablePerformanceMonitoring) {
        monitoring.stop();
      }
    };
  }, []);

  return (
    <ThemeProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <EnterpriseLayout>
            <Suspense fallback={<LoadingSpinner />}>
              <Routes>
                <Route index element={<Index />} />
                <Route path="products-list" element={<ProductsList />} />
                <Route path="reports" element={<Reports />} />
                <Route path="warehouses" element={<WarehousesList />} />
                <Route path="warehouses/:warehouse" element={<WarehousesList />} />
                <Route path="add" element={<AddOperation />} />
                <Route path="settings" element={<Settings />} />
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </EnterpriseLayout>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  );
};

const App = () => (
  <EnhancedErrorBoundary 
    enableReporting={ENV_CONFIG.features.enableErrorReporting}
    showDetails={ENV_CONFIG.isDevelopment}
  >
    <QueryClientProvider client={queryClient}>
      <AppContent />
    </QueryClientProvider>
  </EnhancedErrorBoundary>
);

export default App;
