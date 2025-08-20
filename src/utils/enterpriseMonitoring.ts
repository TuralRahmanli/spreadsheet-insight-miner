// Enterprise monitoring and health checks
import { ENV_CONFIG } from '@/config/environment';
import { log } from './logger';
import { performanceMetrics } from './performanceMetrics';
import { safeStorage, safeApi } from './safeOperations';
import { generateRequestId } from './secureIdGenerator';

// Health check status types
export enum HealthStatus {
  HEALTHY = 'healthy',
  WARNING = 'warning',
  CRITICAL = 'critical',
  UNKNOWN = 'unknown'
}

// System health check interface
export interface HealthCheck {
  name: string;
  status: HealthStatus;
  message: string;
  timestamp: string;
  duration: number;
  metadata?: Record<string, unknown>;
}

// System metrics interface
export interface SystemMetrics {
  memory: {
    used: number;
    total: number;
    percentage: number;
  };
  storage: {
    used: number;
    available: boolean;
    percentage: number;
  };
  network: {
    online: boolean;
    latency: number;
    quality: 'excellent' | 'good' | 'poor' | 'offline';
  };
  performance: {
    averageRenderTime: number;
    averageNetworkTime: number;
    errorRate: number;
  };
}

class EnterpriseMonitoring {
  private static instance: EnterpriseMonitoring;
  private healthChecks: Map<string, HealthCheck> = new Map();
  private isMonitoring = false;
  private monitoringInterval: number | null = null;

  static getInstance(): EnterpriseMonitoring {
    if (!EnterpriseMonitoring.instance) {
      EnterpriseMonitoring.instance = new EnterpriseMonitoring();
    }
    return EnterpriseMonitoring.instance;
  }

  private constructor() {
    if (ENV_CONFIG.features.enablePerformanceMonitoring) {
      this.startMonitoring();
    }
  }

  // Start comprehensive system monitoring
  startMonitoring(): void {
    if (this.isMonitoring) return;

    this.isMonitoring = true;
    log.info('Enterprise monitoring started', 'EnterpriseMonitoring');

    // Perform initial health check
    this.performHealthCheck();

    // Set up periodic monitoring
    this.monitoringInterval = window.setInterval(() => {
      this.performHealthCheck();
    }, 60000); // Every minute
  }

  // Stop monitoring
  stopMonitoring(): void {
    if (!this.isMonitoring) return;

    this.isMonitoring = false;
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }

    log.info('Enterprise monitoring stopped', 'EnterpriseMonitoring');
  }

  // Perform comprehensive health check
  async performHealthCheck(): Promise<Map<string, HealthCheck>> {
    const checkId = generateRequestId();
    log.debug('Starting health check', 'EnterpriseMonitoring', { checkId });

    const checks = await Promise.allSettled([
      this.checkMemoryHealth(),
      this.checkStorageHealth(),
      this.checkNetworkHealth(),
      this.checkPerformanceHealth(),
      this.checkSecurityHealth(),
      this.checkDataIntegrityHealth()
    ]);

    checks.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        this.healthChecks.set(result.value.name, result.value);
      } else {
        const failedCheck: HealthCheck = {
          name: `health_check_${index}`,
          status: HealthStatus.CRITICAL,
          message: `Health check failed: ${result.reason}`,
          timestamp: new Date().toISOString(),
          duration: 0
        };
        this.healthChecks.set(failedCheck.name, failedCheck);
      }
    });

    // Log overall health status
    const criticalChecks = Array.from(this.healthChecks.values()).filter(
      check => check.status === HealthStatus.CRITICAL
    );

    if (criticalChecks.length > 0) {
      log.warn('Critical system issues detected', 'EnterpriseMonitoring', {
        checkId,
        criticalIssues: criticalChecks.map(c => c.name)
      });
    }

    return this.healthChecks;
  }

  // Memory health check
  private async checkMemoryHealth(): Promise<HealthCheck> {
    const startTime = performance.now();
    
    try {
      const memory = (performance as Performance & { 
        memory?: { 
          usedJSHeapSize: number; 
          totalJSHeapSize: number; 
          jsHeapSizeLimit: number; 
        } 
      }).memory;

      if (!memory) {
        return {
          name: 'memory',
          status: HealthStatus.UNKNOWN,
          message: 'Memory API not available',
          timestamp: new Date().toISOString(),
          duration: performance.now() - startTime
        };
      }

      const usagePercentage = (memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100;
      let status: HealthStatus;
      let message: string;

      if (usagePercentage < 70) {
        status = HealthStatus.HEALTHY;
        message = `Memory usage: ${usagePercentage.toFixed(1)}%`;
      } else if (usagePercentage < 85) {
        status = HealthStatus.WARNING;
        message = `High memory usage: ${usagePercentage.toFixed(1)}%`;
      } else {
        status = HealthStatus.CRITICAL;
        message = `Critical memory usage: ${usagePercentage.toFixed(1)}%`;
      }

      return {
        name: 'memory',
        status,
        message,
        timestamp: new Date().toISOString(),
        duration: performance.now() - startTime,
        metadata: {
          usedJSHeapSize: memory.usedJSHeapSize,
          totalJSHeapSize: memory.totalJSHeapSize,
          jsHeapSizeLimit: memory.jsHeapSizeLimit,
          usagePercentage
        }
      };
    } catch (error) {
      return {
        name: 'memory',
        status: HealthStatus.CRITICAL,
        message: `Memory check failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        timestamp: new Date().toISOString(),
        duration: performance.now() - startTime
      };
    }
  }

  // Storage health check
  private async checkStorageHealth(): Promise<HealthCheck> {
    const startTime = performance.now();
    
    try {
      const isAvailable = safeStorage.isAvailable();
      
      if (!isAvailable) {
        return {
          name: 'storage',
          status: HealthStatus.CRITICAL,
          message: 'Local storage not available',
          timestamp: new Date().toISOString(),
          duration: performance.now() - startTime
        };
      }

      // Test storage operations
      const testKey = '__health_check_test__';
      const testData = { timestamp: Date.now() };
      
      const writeSuccess = safeStorage.set(testKey, testData);
      const readData = safeStorage.get(testKey, null);
      const removeSuccess = safeStorage.remove(testKey);

      if (!writeSuccess || !readData || !removeSuccess) {
        return {
          name: 'storage',
          status: HealthStatus.WARNING,
          message: 'Storage operations partially failing',
          timestamp: new Date().toISOString(),
          duration: performance.now() - startTime
        };
      }

      return {
        name: 'storage',
        status: HealthStatus.HEALTHY,
        message: 'Storage operations working normally',
        timestamp: new Date().toISOString(),
        duration: performance.now() - startTime
      };
    } catch (error) {
      return {
        name: 'storage',
        status: HealthStatus.CRITICAL,
        message: `Storage check failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        timestamp: new Date().toISOString(),
        duration: performance.now() - startTime
      };
    }
  }

  // Network health check
  private async checkNetworkHealth(): Promise<HealthCheck> {
    const startTime = performance.now();
    
    try {
      const isOnline = safeApi.isOnline();
      
      if (!isOnline) {
        return {
          name: 'network',
          status: HealthStatus.CRITICAL,
          message: 'Network offline',
          timestamp: new Date().toISOString(),
          duration: performance.now() - startTime
        };
      }

      // Test actual connectivity
      const connectionStart = performance.now();
      const isConnected = await safeApi.checkConnection();
      const latency = performance.now() - connectionStart;

      let status: HealthStatus;
      let quality: 'excellent' | 'good' | 'poor' | 'offline';

      if (!isConnected) {
        status = HealthStatus.CRITICAL;
        quality = 'offline';
      } else if (latency < 100) {
        status = HealthStatus.HEALTHY;
        quality = 'excellent';
      } else if (latency < 500) {
        status = HealthStatus.HEALTHY;
        quality = 'good';
      } else if (latency < 2000) {
        status = HealthStatus.WARNING;
        quality = 'poor';
      } else {
        status = HealthStatus.CRITICAL;
        quality = 'poor';
      }

      return {
        name: 'network',
        status,
        message: `Network ${quality} (${latency.toFixed(0)}ms)`,
        timestamp: new Date().toISOString(),
        duration: performance.now() - startTime,
        metadata: {
          online: isOnline,
          connected: isConnected,
          latency,
          quality
        }
      };
    } catch (error) {
      return {
        name: 'network',
        status: HealthStatus.CRITICAL,
        message: `Network check failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        timestamp: new Date().toISOString(),
        duration: performance.now() - startTime
      };
    }
  }

  // Performance health check
  private async checkPerformanceHealth(): Promise<HealthCheck> {
    const startTime = performance.now();
    
    try {
      const summary = performanceMetrics.getPerformanceSummary();
      
      const avgNetworkTime = summary.summary.averageNetworkTime;
      const slowestOps = summary.summary.slowestOperations;
      
      let status: HealthStatus;
      let message: string;

      if (avgNetworkTime < 1000 && slowestOps.length < 3) {
        status = HealthStatus.HEALTHY;
        message = `Performance good (avg network: ${avgNetworkTime.toFixed(0)}ms)`;
      } else if (avgNetworkTime < 3000 && slowestOps.length < 5) {
        status = HealthStatus.WARNING;
        message = `Performance degraded (avg network: ${avgNetworkTime.toFixed(0)}ms)`;
      } else {
        status = HealthStatus.CRITICAL;
        message = `Performance critical (avg network: ${avgNetworkTime.toFixed(0)}ms)`;
      }

      return {
        name: 'performance',
        status,
        message,
        timestamp: new Date().toISOString(),
        duration: performance.now() - startTime,
        metadata: {
          averageNetworkTime: avgNetworkTime,
          slowOperationsCount: slowestOps.length,
          totalMetrics: summary.summary.totalMetrics
        }
      };
    } catch (error) {
      return {
        name: 'performance',
        status: HealthStatus.CRITICAL,
        message: `Performance check failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        timestamp: new Date().toISOString(),
        duration: performance.now() - startTime
      };
    }
  }

  // Security health check
  private async checkSecurityHealth(): Promise<HealthCheck> {
    const startTime = performance.now();
    
    try {
      let status: HealthStatus = HealthStatus.HEALTHY;
      const issues: string[] = [];

      // Check HTTPS
      if (typeof window !== 'undefined' && window.location.protocol !== 'https:' && !ENV_CONFIG.isDevelopment) {
        status = HealthStatus.WARNING;
        issues.push('Not using HTTPS');
      }

      // Check for secure context
      if (typeof window !== 'undefined' && !window.isSecureContext && !ENV_CONFIG.isDevelopment) {
        status = HealthStatus.WARNING;
        issues.push('Not in secure context');
      }

      // Check Content Security Policy
      const metaCSP = typeof document !== 'undefined' 
        ? document.querySelector('meta[http-equiv="Content-Security-Policy"]')
        : null;
      
      if (!metaCSP && ENV_CONFIG.security.enableCSP) {
        status = HealthStatus.WARNING;
        issues.push('No CSP detected');
      }

      const message = issues.length > 0 
        ? `Security issues: ${issues.join(', ')}`
        : 'Security checks passed';

      return {
        name: 'security',
        status,
        message,
        timestamp: new Date().toISOString(),
        duration: performance.now() - startTime,
        metadata: {
          issues,
          httpsEnabled: typeof window !== 'undefined' && window.location.protocol === 'https:',
          secureContext: typeof window !== 'undefined' && window.isSecureContext
        }
      };
    } catch (error) {
      return {
        name: 'security',
        status: HealthStatus.CRITICAL,
        message: `Security check failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        timestamp: new Date().toISOString(),
        duration: performance.now() - startTime
      };
    }
  }

  // Data integrity health check  
  private async checkDataIntegrityHealth(): Promise<HealthCheck> {
    const startTime = performance.now();
    
    try {
      // Check for critical application data
      const criticalKeys = ['product-storage', 'warehouse-storage', 'app-settings'];
      const missingData: string[] = [];
      const corruptedData: string[] = [];

      for (const key of criticalKeys) {
        try {
          const data = safeStorage.get(key, null);
          if (data === null) {
            missingData.push(key);
          } else if (typeof data !== 'object') {
            corruptedData.push(key);
          }
        } catch (error) {
          corruptedData.push(key);
        }
      }

      let status: HealthStatus;
      let message: string;

      if (corruptedData.length > 0) {
        status = HealthStatus.CRITICAL;
        message = `Data corruption detected: ${corruptedData.join(', ')}`;
      } else if (missingData.length > 1) {
        status = HealthStatus.WARNING;
        message = `Missing data: ${missingData.join(', ')}`;
      } else {
        status = HealthStatus.HEALTHY;
        message = 'Data integrity verified';
      }

      return {
        name: 'data_integrity',
        status,
        message,
        timestamp: new Date().toISOString(),
        duration: performance.now() - startTime,
        metadata: {
          missingData,
          corruptedData,
          checkedKeys: criticalKeys
        }
      };
    } catch (error) {
      return {
        name: 'data_integrity',
        status: HealthStatus.CRITICAL,
        message: `Data integrity check failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        timestamp: new Date().toISOString(),
        duration: performance.now() - startTime
      };
    }
  }

  // Get current system metrics
  async getSystemMetrics(): Promise<SystemMetrics> {
    const healthChecks = await this.performHealthCheck();
    
    const memoryCheck = healthChecks.get('memory');
    const storageCheck = healthChecks.get('storage');
    const networkCheck = healthChecks.get('network');
    const performanceCheck = healthChecks.get('performance');

    return {
      memory: {
        used: memoryCheck?.metadata?.usedJSHeapSize as number || 0,
        total: memoryCheck?.metadata?.jsHeapSizeLimit as number || 0,
        percentage: memoryCheck?.metadata?.usagePercentage as number || 0
      },
      storage: {
        used: 0, // Placeholder - localStorage doesn't provide usage info
        available: storageCheck?.status === HealthStatus.HEALTHY,
        percentage: 0 // Placeholder
      },
      network: {
        online: networkCheck?.metadata?.online as boolean || false,
        latency: networkCheck?.metadata?.latency as number || 0,
        quality: networkCheck?.metadata?.quality as 'excellent' | 'good' | 'poor' | 'offline' || 'offline'
      },
      performance: {
        averageRenderTime: 0, // Placeholder
        averageNetworkTime: performanceCheck?.metadata?.averageNetworkTime as number || 0,
        errorRate: 0 // Placeholder
      }
    };
  }

  // Get health check results
  getHealthChecks(): Map<string, HealthCheck> {
    return new Map(this.healthChecks);
  }

  // Get overall system status
  getOverallStatus(): HealthStatus {
    const checks = Array.from(this.healthChecks.values());
    
    if (checks.some(check => check.status === HealthStatus.CRITICAL)) {
      return HealthStatus.CRITICAL;
    }
    
    if (checks.some(check => check.status === HealthStatus.WARNING)) {
      return HealthStatus.WARNING;
    }
    
    if (checks.length === 0) {
      return HealthStatus.UNKNOWN;
    }
    
    return HealthStatus.HEALTHY;
  }
}

// Export singleton instance
export const enterpriseMonitoring = EnterpriseMonitoring.getInstance();

// Convenience exports
export const monitoring = {
  start: () => enterpriseMonitoring.startMonitoring(),
  stop: () => enterpriseMonitoring.stopMonitoring(),
  check: () => enterpriseMonitoring.performHealthCheck(),
  metrics: () => enterpriseMonitoring.getSystemMetrics(),
  status: () => enterpriseMonitoring.getOverallStatus(),
  health: () => enterpriseMonitoring.getHealthChecks()
};