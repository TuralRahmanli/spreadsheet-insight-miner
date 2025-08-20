// Enterprise security monitoring overlay
import React, { useState, useEffect } from 'react';
import { Shield, AlertTriangle, CheckCircle, X, Eye, EyeOff } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ENV_CONFIG } from '@/config/environment';
import { monitoring, HealthStatus } from '@/utils/enterpriseMonitoring';
import { log } from '@/utils/logger';

interface SecurityCheck {
  name: string;
  status: 'pass' | 'warning' | 'fail';
  message: string;
  recommendation?: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

export const SecurityOverlay: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [securityChecks, setSecurityChecks] = useState<SecurityCheck[]>([]);
  const [lastScan, setLastScan] = useState<Date | null>(null);
  const [isScanning, setIsScanning] = useState(false);

  // Perform comprehensive security scan
  const performSecurityScan = async () => {
    if (isScanning) return;
    
    setIsScanning(true);
    log.info('Starting security scan', 'SecurityOverlay');
    
    try {
      const checks: SecurityCheck[] = [];
      
      // Check HTTPS usage
      if (typeof window !== 'undefined') {
        const isHttps = window.location.protocol === 'https:';
        checks.push({
          name: 'HTTPS Protocol',
          status: isHttps || ENV_CONFIG.isDevelopment ? 'pass' : 'fail',
          message: isHttps ? 'Using secure HTTPS protocol' : 'Not using HTTPS protocol',
          recommendation: !isHttps ? 'Enable HTTPS in production' : undefined,
          severity: isHttps ? 'low' : 'high'
        });
      }

      // Check secure context
      if (typeof window !== 'undefined') {
        const isSecureContext = window.isSecureContext;
        checks.push({
          name: 'Secure Context',
          status: isSecureContext || ENV_CONFIG.isDevelopment ? 'pass' : 'warning',
          message: isSecureContext ? 'Running in secure context' : 'Not in secure context',
          recommendation: !isSecureContext ? 'Ensure secure context for sensitive operations' : undefined,
          severity: isSecureContext ? 'low' : 'medium'
        });
      }

      // Check Content Security Policy
      const cspMeta = typeof document !== 'undefined' 
        ? document.querySelector('meta[http-equiv="Content-Security-Policy"]')
        : null;
      
      checks.push({
        name: 'Content Security Policy',
        status: cspMeta ? 'pass' : 'warning',
        message: cspMeta ? 'CSP header detected' : 'No CSP header detected',
        recommendation: !cspMeta ? 'Implement Content Security Policy headers' : undefined,
        severity: cspMeta ? 'low' : 'medium'
      });

      // Check for sensitive data in localStorage
      let sensitiveDataFound = false;
      const sensitivePatterns = ['password', 'token', 'secret', 'key', 'auth'];
      
      if (typeof localStorage !== 'undefined') {
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && sensitivePatterns.some(pattern => key.toLowerCase().includes(pattern))) {
            sensitiveDataFound = true;
            break;
          }
        }
      }

      checks.push({
        name: 'Sensitive Data Storage',
        status: sensitiveDataFound ? 'warning' : 'pass',
        message: sensitiveDataFound 
          ? 'Potentially sensitive data found in localStorage' 
          : 'No sensitive data found in localStorage',
        recommendation: sensitiveDataFound 
          ? 'Review and encrypt sensitive data in storage' 
          : undefined,
        severity: sensitiveDataFound ? 'medium' : 'low'
      });

      // Check for mixed content
      let mixedContentFound = false;
      if (typeof document !== 'undefined' && window.location.protocol === 'https:') {
        const httpResources = Array.from(document.querySelectorAll('*')).some(element => {
          const src = element.getAttribute('src');
          const href = element.getAttribute('href');
          return (src && src.startsWith('http:')) || (href && href.startsWith('http:'));
        });
        mixedContentFound = httpResources;
      }

      checks.push({
        name: 'Mixed Content',
        status: mixedContentFound ? 'warning' : 'pass',
        message: mixedContentFound 
          ? 'HTTP resources detected on HTTPS page' 
          : 'No mixed content detected',
        recommendation: mixedContentFound 
          ? 'Replace HTTP resources with HTTPS versions' 
          : undefined,
        severity: mixedContentFound ? 'medium' : 'low'
      });

      // Check Web Crypto API availability
      const cryptoAvailable = typeof crypto !== 'undefined' && 
                             crypto.subtle !== undefined;
      
      checks.push({
        name: 'Web Crypto API',
        status: cryptoAvailable ? 'pass' : 'warning',
        message: cryptoAvailable 
          ? 'Web Crypto API available' 
          : 'Web Crypto API not available',
        recommendation: !cryptoAvailable 
          ? 'Enable secure context for crypto operations' 
          : undefined,
        severity: cryptoAvailable ? 'low' : 'medium'
      });

      // Check for console usage in production
      const consoleOverridden = typeof console !== 'undefined' && 
                               console.log.toString().includes('[native code]');
      
      checks.push({
        name: 'Console Security',
        status: ENV_CONFIG.isDevelopment || !consoleOverridden ? 'pass' : 'warning',
        message: ENV_CONFIG.isDevelopment 
          ? 'Development mode - console enabled'
          : consoleOverridden 
            ? 'Console methods may be overridden'
            : 'Console properly secured',
        recommendation: !ENV_CONFIG.isDevelopment && consoleOverridden
          ? 'Review console method overrides for security'
          : undefined,
        severity: 'low'
      });

      // Check browser security features
      const securityHeaders = [
        'X-Content-Type-Options',
        'X-Frame-Options', 
        'X-XSS-Protection',
        'Referrer-Policy'
      ];

      // This would need to be checked via response headers in a real implementation
      checks.push({
        name: 'Security Headers',
        status: 'warning',
        message: 'Security headers status unknown (client-side check)',
        recommendation: 'Verify security headers are properly configured on server',
        severity: 'medium'
      });

      setSecurityChecks(checks);
      setLastScan(new Date());
      
      const failedChecks = checks.filter(c => c.status === 'fail').length;
      const warningChecks = checks.filter(c => c.status === 'warning').length;
      
      log.info('Security scan completed', 'SecurityOverlay', {
        totalChecks: checks.length,
        passed: checks.length - failedChecks - warningChecks,
        warnings: warningChecks,
        failed: failedChecks
      });
      
    } catch (error) {
      log.error('Security scan failed', 'SecurityOverlay', error);
    } finally {
      setIsScanning(false);
    }
  };

  // Auto-scan on mount and periodically
  useEffect(() => {
    if (ENV_CONFIG.isDevelopment) {
      performSecurityScan();
      
      // Scan every 5 minutes in development
      const interval = setInterval(performSecurityScan, 5 * 60 * 1000);
      return () => clearInterval(interval);
    }
  }, []);

  // Don't show in production unless explicitly enabled
  if (!ENV_CONFIG.isDevelopment && !ENV_CONFIG.features.enablePerformanceMonitoring) {
    return null;
  }

  const getStatusColor = (status: SecurityCheck['status']) => {
    switch (status) {
      case 'pass': return 'bg-green-500';
      case 'warning': return 'bg-yellow-500';
      case 'fail': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusIcon = (status: SecurityCheck['status']) => {
    switch (status) {
      case 'pass': return <CheckCircle className="h-4 w-4" />;
      case 'warning': return <AlertTriangle className="h-4 w-4" />;
      case 'fail': return <X className="h-4 w-4" />;
      default: return <Shield className="h-4 w-4" />;
    }
  };

  const getSeverityColor = (severity: SecurityCheck['severity']) => {
    switch (severity) {
      case 'low': return 'secondary';
      case 'medium': return 'default';
      case 'high': return 'destructive';
      case 'critical': return 'destructive';
      default: return 'secondary';
    }
  };

  const criticalIssues = securityChecks.filter(c => c.severity === 'critical' || c.status === 'fail');
  const warningIssues = securityChecks.filter(c => c.status === 'warning');

  if (!isVisible) {
    return (
      <Button
        variant="outline"
        size="sm"
        className="fixed bottom-4 right-4 z-50 bg-background/90 backdrop-blur"
        onClick={() => setIsVisible(true)}
        title="Security Monitor"
      >
        <Shield className="h-4 w-4 mr-2" />
        Security
        {criticalIssues.length > 0 && (
          <Badge variant="destructive" className="ml-2">
            {criticalIssues.length}
          </Badge>
        )}
      </Button>
    );
  }

  return (
    <Card className="fixed bottom-4 right-4 z-50 w-96 max-h-96 overflow-auto bg-background/95 backdrop-blur border shadow-lg">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            <CardTitle className="text-base">Security Monitor</CardTitle>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={performSecurityScan}
              disabled={isScanning}
              title="Refresh scan"
            >
              {isScanning ? '...' : '🔄'}
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
          {lastScan ? `Last scan: ${lastScan.toLocaleTimeString()}` : 'No scan performed'}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-3">
        {/* Overall Status */}
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="text-green-600">
            <div className="font-bold">{securityChecks.filter(c => c.status === 'pass').length}</div>
            <div className="text-xs">Passed</div>
          </div>
          <div className="text-yellow-600">
            <div className="font-bold">{warningIssues.length}</div>
            <div className="text-xs">Warnings</div>
          </div>
          <div className="text-red-600">
            <div className="font-bold">{criticalIssues.length}</div>
            <div className="text-xs">Critical</div>
          </div>
        </div>

        {/* Critical Issues Alert */}
        {criticalIssues.length > 0 && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              {criticalIssues.length} critical security issue{criticalIssues.length !== 1 ? 's' : ''} detected
            </AlertDescription>
          </Alert>
        )}

        {/* Security Checks List */}
        <div className="space-y-2 max-h-48 overflow-auto">
          {securityChecks.map((check, index) => (
            <Collapsible key={`security-check-${index}`}>
              <CollapsibleTrigger className="flex items-center justify-between w-full p-2 text-left hover:bg-muted/50 rounded">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${getStatusColor(check.status)}`} />
                  <span className="text-sm font-medium">{check.name}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Badge variant={getSeverityColor(check.severity)} className="text-xs">
                    {check.severity}
                  </Badge>
                  {getStatusIcon(check.status)}
                </div>
              </CollapsibleTrigger>
              
              <CollapsibleContent className="px-4 pb-2">
                <div className="text-xs space-y-1">
                  <p className="text-muted-foreground">{check.message}</p>
                  {check.recommendation && (
                    <p className="text-blue-600">
                      <strong>Recommendation:</strong> {check.recommendation}
                    </p>
                  )}
                </div>
              </CollapsibleContent>
            </Collapsible>
          ))}
        </div>

        {securityChecks.length === 0 && (
          <div className="text-center text-muted-foreground text-sm py-4">
            {isScanning ? 'Scanning security...' : 'No security checks performed'}
          </div>
        )}
      </CardContent>
    </Card>
  );
};