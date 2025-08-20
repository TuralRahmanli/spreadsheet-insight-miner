// Enterprise-grade performance metrics and monitoring
import { ENV_CONFIG } from '@/config/environment';
import { log } from './logger';
import { generateRequestId } from './secureIdGenerator';

// Performance metric types
interface PerformanceMetric {
  id: string;
  name: string;
  value: number;
  unit: 'ms' | 'bytes' | 'count' | 'percentage';
  timestamp: number;
  tags?: Record<string, string>;
}

interface PerformanceBenchmark {
  id: string;
  name: string;
  startTime: number;
  endTime?: number;
  duration?: number;
  metadata?: Record<string, unknown>;
}

// Memory usage tracking
interface MemoryMetrics {
  usedJSHeapSize: number;
  totalJSHeapSize: number;
  jsHeapSizeLimit: number;
  timestamp: number;
}

// Network timing metrics
interface NetworkTiming {
  requestId: string;
  url: string;
  method: string;
  startTime: number;
  endTime: number;
  duration: number;
  status: number;
  size: number;
}

class PerformanceMetrics {
  private static instance: PerformanceMetrics;
  private metrics: PerformanceMetric[] = [];
  private benchmarks: Map<string, PerformanceBenchmark> = new Map();
  private networkTimings: NetworkTiming[] = [];
  private memoryHistory: MemoryMetrics[] = [];
  private maxMetrics = ENV_CONFIG.performance.maxCacheSize || 1000;

  static getInstance(): PerformanceMetrics {
    if (!PerformanceMetrics.instance) {
      PerformanceMetrics.instance = new PerformanceMetrics();
    }
    return PerformanceMetrics.instance;
  }

  private constructor() {
    if (ENV_CONFIG.features.enablePerformanceMonitoring) {
      this.startMemoryMonitoring();
      this.attachNetworkMonitoring();
    }
  }

  // Record a performance metric
  recordMetric(name: string, value: number, unit: PerformanceMetric['unit'], tags?: Record<string, string>): void {
    const metric: PerformanceMetric = {
      id: generateRequestId(),
      name,
      value,
      unit,
      timestamp: Date.now(),
      tags
    };

    this.metrics.push(metric);
    
    // Keep only the most recent metrics
    if (this.metrics.length > this.maxMetrics) {
      this.metrics = this.metrics.slice(-this.maxMetrics);
    }

    if (ENV_CONFIG.isDevelopment) {
      log.debug(`Performance metric: ${name} = ${value}${unit}`, 'PerformanceMetrics', { metric });
    }
  }

  // Start a performance benchmark
  startBenchmark(name: string, metadata?: Record<string, unknown>): string {
    const id = generateRequestId();
    const benchmark: PerformanceBenchmark = {
      id,
      name,
      startTime: performance.now(),
      metadata
    };

    this.benchmarks.set(id, benchmark);
    return id;
  }

  // End a performance benchmark
  endBenchmark(id: string): number | null {
    const benchmark = this.benchmarks.get(id);
    if (!benchmark) {
      log.warn('Benchmark not found', 'PerformanceMetrics', { id });
      return null;
    }

    const endTime = performance.now();
    const duration = endTime - benchmark.startTime;

    benchmark.endTime = endTime;
    benchmark.duration = duration;

    // Record as metric
    this.recordMetric(benchmark.name, duration, 'ms', {
      benchmarkId: id,
      ...benchmark.metadata as Record<string, string>
    });

    this.benchmarks.delete(id);
    return duration;
  }

  // Memory monitoring
  private startMemoryMonitoring(): void {
    if (typeof window === 'undefined') return;

    const collectMemoryMetrics = () => {
      try {
        const memory = (performance as Performance & { 
          memory?: { 
            usedJSHeapSize: number; 
            totalJSHeapSize: number; 
            jsHeapSizeLimit: number; 
          } 
        }).memory;
        
        if (memory) {
          const metrics: MemoryMetrics = {
            usedJSHeapSize: memory.usedJSHeapSize,
            totalJSHeapSize: memory.totalJSHeapSize,
            jsHeapSizeLimit: memory.jsHeapSizeLimit,
            timestamp: Date.now()
          };

          this.memoryHistory.push(metrics);
          
          // Keep only last 100 memory samples
          if (this.memoryHistory.length > 100) {
            this.memoryHistory = this.memoryHistory.slice(-100);
          }

          // Record memory usage percentage
          const usagePercentage = (memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100;
          this.recordMetric('memory_usage_percentage', usagePercentage, 'percentage');

          // Alert on high memory usage
          if (usagePercentage > 85) {
            log.warn('High memory usage detected', 'PerformanceMetrics', { 
              usagePercentage: usagePercentage.toFixed(2) + '%',
              usedMB: (memory.usedJSHeapSize / 1024 / 1024).toFixed(2)
            });
          }
        }
      } catch (error) {
        log.error('Memory monitoring failed', 'PerformanceMetrics', error);
      }
    };

    // Collect memory metrics every 30 seconds
    setInterval(collectMemoryMetrics, 30000);
    collectMemoryMetrics(); // Initial collection
  }

  // Network monitoring
  private attachNetworkMonitoring(): void {
    if (typeof window === 'undefined') return;

    // Monitor fetch requests
    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
      const requestId = generateRequestId();
      const url = args[0]?.toString() || 'unknown';
      const method = args[1]?.method || 'GET';
      const startTime = performance.now();

      try {
        const response = await originalFetch(...args);
        const endTime = performance.now();
        const duration = endTime - startTime;

        const timing: NetworkTiming = {
          requestId,
          url,
          method,
          startTime,
          endTime,
          duration,
          status: response.status,
          size: parseInt(response.headers.get('content-length') || '0')
        };

        this.networkTimings.push(timing);
        
        // Keep only last 50 network timings
        if (this.networkTimings.length > 50) {
          this.networkTimings = this.networkTimings.slice(-50);
        }

        // Record network timing metrics
        this.recordMetric('network_request_duration', duration, 'ms', {
          url: url.substring(0, 100), // Limit URL length
          method,
          status: response.status.toString()
        });

        // Alert on slow requests
        if (duration > 5000) {
          log.warn('Slow network request detected', 'PerformanceMetrics', {
            url,
            method,
            duration: duration.toFixed(2) + 'ms',
            status: response.status
          });
        }

        return response;
      } catch (error) {
        const endTime = performance.now();
        const duration = endTime - startTime;

        this.recordMetric('network_request_error', duration, 'ms', {
          url: url.substring(0, 100),
          method,
          error: 'failed'
        });

        throw error;
      }
    };
  }

  // Component render timing
  measureComponentRender<T>(componentName: string, renderFunction: () => T): T {
    const benchmarkId = this.startBenchmark(`component_render_${componentName}`, {
      component: componentName
    });

    try {
      const result = renderFunction();
      return result;
    } finally {
      this.endBenchmark(benchmarkId);
    }
  }

  // Get performance summary
  getPerformanceSummary(): {
    metrics: PerformanceMetric[];
    activeBenchmarks: PerformanceBenchmark[];
    networkTimings: NetworkTiming[];
    memoryHistory: MemoryMetrics[];
    summary: {
      totalMetrics: number;
      averageNetworkTime: number;
      currentMemoryUsage: number | null;
      slowestOperations: PerformanceMetric[];
    };
  } {
    const networkAverage = this.networkTimings.length > 0
      ? this.networkTimings.reduce((sum, timing) => sum + timing.duration, 0) / this.networkTimings.length
      : 0;

    const currentMemory = this.memoryHistory.length > 0
      ? this.memoryHistory[this.memoryHistory.length - 1]
      : null;

    const slowestOperations = [...this.metrics]
      .filter(m => m.unit === 'ms')
      .sort((a, b) => b.value - a.value)
      .slice(0, 10);

    return {
      metrics: [...this.metrics],
      activeBenchmarks: Array.from(this.benchmarks.values()),
      networkTimings: [...this.networkTimings],
      memoryHistory: [...this.memoryHistory],
      summary: {
        totalMetrics: this.metrics.length,
        averageNetworkTime: networkAverage,
        currentMemoryUsage: currentMemory ? currentMemory.usedJSHeapSize : null,
        slowestOperations
      }
    };
  }

  // Clear all metrics
  clearMetrics(): void {
    this.metrics = [];
    this.benchmarks.clear();
    this.networkTimings = [];
    this.memoryHistory = [];
    log.info('Performance metrics cleared', 'PerformanceMetrics');
  }

  // Export metrics for analysis
  exportMetrics(): string {
    const summary = this.getPerformanceSummary();
    const exportData = {
      timestamp: new Date().toISOString(),
      appVersion: ENV_CONFIG.app.version,
      environment: ENV_CONFIG.isDevelopment ? 'development' : 'production',
      ...summary
    };

    return JSON.stringify(exportData, null, 2);
  }
}

// Export singleton instance and convenience functions
export const performanceMetrics = PerformanceMetrics.getInstance();

export const metrics = {
  record: (name: string, value: number, unit: PerformanceMetric['unit'], tags?: Record<string, string>) =>
    performanceMetrics.recordMetric(name, value, unit, tags),
    
  startBenchmark: (name: string, metadata?: Record<string, unknown>) =>
    performanceMetrics.startBenchmark(name, metadata),
    
  endBenchmark: (id: string) =>
    performanceMetrics.endBenchmark(id),
    
  measureRender: <T>(componentName: string, renderFunction: () => T) =>
    performanceMetrics.measureComponentRender(componentName, renderFunction),
    
  getSummary: () =>
    performanceMetrics.getPerformanceSummary(),
    
  export: () =>
    performanceMetrics.exportMetrics(),
    
  clear: () =>
    performanceMetrics.clearMetrics()
};
