// Enterprise-grade layout component with comprehensive monitoring
import React, { Suspense, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from './AppSidebar';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { NetworkStatus } from '@/components/NetworkStatus';
import { OfflineIndicator } from '@/components/OfflineIndicator';
import { PerformanceOverlay } from '@/components/PerformanceMonitor';
import { AccessibilityOverlay } from '@/components/AccessibilityChecker';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { SkipLinks } from '@/components/SkipLinks';
import { ENV_CONFIG } from '@/config/environment';
import { log } from '@/utils/logger';
import { metrics } from '@/utils/performanceMetrics';

interface EnterpriseLayoutProps {
  children?: React.ReactNode;
}

export const EnterpriseLayout: React.FC<EnterpriseLayoutProps> = ({ children }) => {
  useEffect(() => {
    // Initialize layout performance tracking
    const layoutRenderStart = metrics.startBenchmark('layout_render');
    
    log.info('Enterprise layout initialized', 'EnterpriseLayout', {
      environment: ENV_CONFIG.isDevelopment ? 'development' : 'production',
      features: ENV_CONFIG.features,
      timestamp: new Date().toISOString()
    });

    return () => {
      metrics.endBenchmark(layoutRenderStart);
    };
  }, []);

  return (
    <ErrorBoundary>
      <SidebarProvider>
        <div className="flex min-h-screen w-full">
          {/* Skip Navigation Links for Accessibility */}
          <SkipLinks />
          
          {/* Global Header with Sidebar Trigger */}
          <header className="fixed top-0 left-0 right-0 z-40 h-12 flex items-center border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <SidebarTrigger 
              className="ml-2" 
              aria-label="Toggle sidebar navigation"
            />
            
            {/* Application Title - for screen readers */}
            <h1 className="sr-only">
              {ENV_CONFIG.app.name} - Inventory Management System
            </h1>
            
            {/* Status Indicators */}
            <div className="ml-auto mr-4 flex items-center gap-2">
              <NetworkStatus />
              <OfflineIndicator />
            </div>
          </header>

          {/* Sidebar Navigation */}
          <AppSidebar />

          {/* Main Content Area */}
          <main 
            id="main-content" 
            className="flex-1 pt-12 overflow-auto"
            role="main"
            aria-label="Main content area"
          >
            <div className="container mx-auto p-4 max-w-full">
              <Suspense 
                fallback={
                  <div className="flex items-center justify-center min-h-[400px]">
                    <LoadingSpinner />
                  </div>
                }
              >
                {children || <Outlet />}
              </Suspense>
            </div>
          </main>

          {/* Development Overlays */}
          {ENV_CONFIG.isDevelopment && (
            <>
              {ENV_CONFIG.features.enablePerformanceMonitoring && (
                <PerformanceOverlay />
              )}
              <AccessibilityOverlay />
            </>
          )}
        </div>
      </SidebarProvider>
    </ErrorBoundary>
  );
};

// Layout with built-in error boundary for maximum resilience
export default EnterpriseLayout;