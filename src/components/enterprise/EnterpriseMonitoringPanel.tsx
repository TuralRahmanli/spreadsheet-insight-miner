// Comprehensive enterprise monitoring dashboard
import React, { useState, useEffect } from 'react';
import { Activity, Shield, Zap, Database, Wifi, Eye, EyeOff } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { PerformanceOverlay } from '@/components/PerformanceMonitor';
import { SecurityOverlay } from './SecurityOverlay';
import { ENV_CONFIG } from '@/config/environment';
import { monitoring, HealthStatus } from '@/utils/enterpriseMonitoring';
import { metrics } from '@/utils/performanceMetrics';
import { log } from '@/utils/logger';

interface MonitoringData {
  performance: {
    avgRenderTime: number;
    avgNetworkTime: number;
    memoryUsage: number;
    fps: number;
  };
  security: {
    status: HealthStatus;
    issues: number;
    lastScan: Date | null;
  };
  system: {
    uptime: number;
    requestCount: number;
    errorRate: number;
    cacheHitRate: number;
  };
}

export const EnterpriseMonitoringPanel: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [monitoringData, setMonitoringData] = useState<MonitoringData>({
    performance: { avgRenderTime: 0, avgNetworkTime: 0, memoryUsage: 0, fps: 60 },
    security: { status: HealthStatus.HEALTHY, issues: 0, lastScan: null },
    system: { uptime: 0, requestCount: 0, errorRate: 0, cacheHitRate: 0 }
  });
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  // Update monitoring data
  const updateMonitoringData = async () => {
    try {
      const healthChecks = await monitoring.check();
      const performanceSummary = metrics.getSummary();
      const systemMetrics = await monitoring.metrics();

      const securityHealth = healthChecks.get('security');
      const performanceHealth = healthChecks.get('performance');
      const memoryHealth = healthChecks.get('memory');

      setMonitoringData({
        performance: {
          avgRenderTime: performanceHealth?.metadata?.averageRenderTime as number || 0,
          avgNetworkTime: performanceSummary.summary.averageNetworkTime,
          memoryUsage: systemMetrics.memory.percentage,
          fps: 60 // Placeholder
        },
        security: {
          status: securityHealth?.status || HealthStatus.UNKNOWN,
          issues: Array.from(healthChecks.values()).filter(
            check => check.status === HealthStatus.CRITICAL || check.status === HealthStatus.WARNING
          ).length,
          lastScan: securityHealth ? new Date(securityHealth.timestamp) : null
        },
        system: {
          uptime: Date.now() - (ENV_CONFIG.app.build ? parseInt(ENV_CONFIG.app.build) : Date.now()),
          requestCount: performanceSummary.networkTimings.length,
          errorRate: 0, // Calculate from error logs
          cacheHitRate: 85 // Placeholder
        }
      });

      setLastUpdate(new Date());
      
      log.debug('Monitoring data updated', 'EnterpriseMonitoringPanel', {
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      log.error('Failed to update monitoring data', 'EnterpriseMonitoringPanel', error);
    }
  };

  // Auto-update data
  useEffect(() => {
    if (isVisible) {
      updateMonitoringData();
      const interval = setInterval(updateMonitoringData, 10000); // Every 10 seconds
      return () => clearInterval(interval);
    }
  }, [isVisible]);

  // Don't show in production unless explicitly enabled
  if (!ENV_CONFIG.isDevelopment && !ENV_CONFIG.features.enablePerformanceMonitoring) {
    return null;
  }

  const formatUptime = (ms: number): string => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    
    if (hours > 0) return `${hours}h ${minutes % 60}m`;
    if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
    return `${seconds}s`;
  };

  const getStatusColor = (status: HealthStatus): string => {
    switch (status) {
      case HealthStatus.HEALTHY: return 'text-green-600';
      case HealthStatus.WARNING: return 'text-yellow-600';
      case HealthStatus.CRITICAL: return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusBadgeVariant = (status: HealthStatus) => {
    switch (status) {
      case HealthStatus.HEALTHY: return 'default' as const;
      case HealthStatus.WARNING: return 'secondary' as const;
      case HealthStatus.CRITICAL: return 'destructive' as const;
      default: return 'outline' as const;
    }
  };

  if (!isVisible) {
    return (
      <Button
        variant="outline"
        size="sm"
        className="fixed bottom-16 right-4 z-50 bg-background/90 backdrop-blur"
        onClick={() => setIsVisible(true)}
        title="Enterprise Monitor"
      >
        <Activity className="h-4 w-4 mr-2" />
        Monitor
        {monitoringData.security.issues > 0 && (
          <Badge variant="destructive" className="ml-2">
            {monitoringData.security.issues}
          </Badge>
        )}
      </Button>
    );
  }

  return (
    <Card className="fixed bottom-4 right-4 z-50 w-[500px] max-h-[600px] overflow-hidden bg-background/95 backdrop-blur border shadow-xl">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            <CardTitle className="text-base">Enterprise Monitor</CardTitle>
            <Badge variant={getStatusBadgeVariant(monitoringData.security.status)}>
              {monitoringData.security.status}
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={updateMonitoringData}
              title="Refresh data"
            >
              🔄
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsVisible(false)}
              title="Hide"
            >
              <EyeOff className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        <CardDescription className="text-xs">
          Last updated: {lastUpdate.toLocaleTimeString()}
        </CardDescription>
      </CardHeader>

      <CardContent className="p-4">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
            <TabsTrigger value="system">System</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4 mt-4">
            {/* Key Metrics Grid */}
            <div className="grid grid-cols-2 gap-3">
              <Card className="p-3">
                <div className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-blue-500" />
                  <div>
                    <div className="text-sm font-medium">Performance</div>
                    <div className="text-xs text-muted-foreground">
                      {monitoringData.performance.avgNetworkTime.toFixed(0)}ms avg
                    </div>
                  </div>
                </div>
              </Card>

              <Card className="p-3">
                <div className="flex items-center gap-2">
                  <Shield className={`h-4 w-4 ${getStatusColor(monitoringData.security.status)}`} />
                  <div>
                    <div className="text-sm font-medium">Security</div>
                    <div className="text-xs text-muted-foreground">
                      {monitoringData.security.issues} issues
                    </div>
                  </div>
                </div>
              </Card>

              <Card className="p-3">
                <div className="flex items-center gap-2">
                  <Database className="h-4 w-4 text-purple-500" />
                  <div>
                    <div className="text-sm font-medium">Memory</div>
                    <div className="text-xs text-muted-foreground">
                      {monitoringData.performance.memoryUsage.toFixed(1)}%
                    </div>
                  </div>
                </div>
              </Card>

              <Card className="p-3">
                <div className="flex items-center gap-2">
                  <Wifi className="h-4 w-4 text-green-500" />
                  <div>
                    <div className="text-sm font-medium">Requests</div>
                    <div className="text-xs text-muted-foreground">
                      {monitoringData.system.requestCount} total
                    </div>
                  </div>
                </div>
              </Card>
            </div>

            {/* System Status */}
            <Card className="p-3">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Uptime</span>
                  <span className="font-mono">{formatUptime(monitoringData.system.uptime)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Cache Hit Rate</span>
                  <span className="font-mono">{monitoringData.system.cacheHitRate}%</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Error Rate</span>
                  <span className="font-mono">{monitoringData.system.errorRate.toFixed(2)}%</span>
                </div>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="performance" className="space-y-4 mt-4">
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Network Response Time</span>
                  <span>{monitoringData.performance.avgNetworkTime.toFixed(0)}ms</span>
                </div>
                <Progress 
                  value={Math.min(monitoringData.performance.avgNetworkTime / 20, 100)} 
                  className="h-2"
                />
              </div>

              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Memory Usage</span>
                  <span>{monitoringData.performance.memoryUsage.toFixed(1)}%</span>
                </div>
                <Progress 
                  value={monitoringData.performance.memoryUsage} 
                  className="h-2"
                />
              </div>

              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Frame Rate</span>
                  <span>{monitoringData.performance.fps} FPS</span>
                </div>
                <Progress 
                  value={(monitoringData.performance.fps / 60) * 100} 
                  className="h-2"
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="security" className="space-y-4 mt-4">
            <div className="text-center">
              <div className={`text-2xl font-bold ${getStatusColor(monitoringData.security.status)}`}>
                {monitoringData.security.status.toUpperCase()}
              </div>
              <div className="text-sm text-muted-foreground">
                {monitoringData.security.issues} issues detected
              </div>
              {monitoringData.security.lastScan && (
                <div className="text-xs text-muted-foreground mt-1">
                  Last scan: {monitoringData.security.lastScan.toLocaleTimeString()}
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="system" className="space-y-4 mt-4">
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span>App Version</span>
                <span className="font-mono">{ENV_CONFIG.app.version}</span>
              </div>
              <div className="flex justify-between">
                <span>Environment</span>
                <span className="font-mono">
                  {ENV_CONFIG.isDevelopment ? 'Development' : 'Production'}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Build</span>
                <span className="font-mono text-xs">{ENV_CONFIG.app.build}</span>
              </div>
              <div className="flex justify-between">
                <span>Features</span>
                <div className="text-right">
                  {Object.entries(ENV_CONFIG.features).map(([key, enabled]) => 
                    enabled && (
                      <Badge key={key} variant="outline" className="ml-1 text-xs">
                        {key.replace('enable', '')}
                      </Badge>
                    )
                  )}
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};