import { Suspense, lazy } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { NetworkStatus } from "./components/NetworkStatus";
import { OfflineIndicator } from "./components/OfflineIndicator";
import { PerformanceOverlay } from "./components/PerformanceMonitor";
import { AccessibilityOverlay } from "./components/AccessibilityChecker";
import { useAppIntents } from "./hooks/useAppIntents";
import Layout from "./components/Layout";
import { LoadingSpinner } from "./components/LoadingSpinner";

// Lazy load pages for better performance
const Index = lazy(() => import("./pages/Index"));
const Products = lazy(() => import("./pages/Products"));
const ProductsList = lazy(() => import("./pages/ProductsList"));
const Reports = lazy(() => import("./pages/Reports"));
const Templates = lazy(() => import("./pages/Templates"));
const AddOperation = lazy(() => import("./pages/AddOperation"));
const WarehousesList = lazy(() => import("./pages/WarehousesList"));
const Settings = lazy(() => import("./pages/Settings"));
const NotFound = lazy(() => import("./pages/NotFound"));

const queryClient = new QueryClient();

const AppContent = () => {
  // Initialize app intents handling for file associations
  useAppIntents();

  return (
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <NetworkStatus />
      <OfflineIndicator />
      <PerformanceOverlay />
      <AccessibilityOverlay />
      <BrowserRouter>
        <Suspense fallback={<LoadingSpinner />}>
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route index element={<Index />} />
              <Route path="products" element={<Products />} />
              <Route path="products-list" element={<ProductsList />} />
              <Route path="reports" element={<Reports />} />
              <Route path="templates" element={<Templates />} />
              <Route path="warehouses" element={<WarehousesList />} />
              <Route path="warehouses/:warehouse" element={<WarehousesList />} />
              <Route path="add" element={<AddOperation />} />
              <Route path="settings" element={<Settings />} />
            </Route>
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </TooltipProvider>
  );
};

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <AppContent />
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
