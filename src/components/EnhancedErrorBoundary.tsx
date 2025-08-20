import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { AlertTriangle, RefreshCw, Bug, ChevronDown, Copy, Send } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  showDetails?: boolean;
  enableReporting?: boolean;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  errorId: string;
  retryCount: number;
  isReporting: boolean;
  showDetails: boolean;
}

class EnhancedErrorBoundary extends Component<Props, State> {
  private maxRetries = 3;
  private errorReportingEndpoint = '/api/error-reports';

  constructor(props: Props) {
    super(props);
    
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: '',
      retryCount: 0,
      isReporting: false,
      showDetails: false
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    const errorId = `error-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    return {
      hasError: true,
      error,
      errorId,
      showDetails: false
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Only log in development mode
    if (process.env.NODE_ENV === 'development') {
      console.error('Error Boundary caught an error:', error, errorInfo);
      console.group(`🚨 Error Boundary: ${error.name}`);
      console.error('Error:', error.message);
      console.error('Stack:', error.stack);
      console.error('Component Stack:', errorInfo.componentStack);
      console.groupEnd();
    }
    
    this.setState({ errorInfo });
    
    // Call custom error handler if provided
    this.props.onError?.(error, errorInfo);

    // Store error in localStorage for debugging
    this.storeErrorLocally(error, errorInfo);
    
    // Auto-report if enabled
    if (this.props.enableReporting) {
      this.reportError(error, errorInfo);
    }
  }

  private storeErrorLocally = (error: Error, errorInfo: ErrorInfo) => {
    try {
      const errorData = {
        timestamp: new Date().toISOString(),
        errorId: this.state.errorId,
        message: error.message,
        name: error.name,
        stack: error.stack,
        componentStack: errorInfo.componentStack,
        userAgent: navigator.userAgent,
        url: window.location.href,
        retryCount: this.state.retryCount
      };

      const existingErrors = JSON.parse(localStorage.getItem('app-errors') || '[]');
      existingErrors.push(errorData);
      
      // Keep only last 10 errors
      const recentErrors = existingErrors.slice(-10);
      localStorage.setItem('app-errors', JSON.stringify(recentErrors));
      } catch (e) {
        if (process.env.NODE_ENV === 'development') {
          console.warn('Could not store error locally:', e);
        }
      }
  };

  private reportError = async (error: Error, errorInfo: ErrorInfo) => {
    if (this.state.isReporting) return;
    
    this.setState({ isReporting: true });

    try {
      const errorReport = {
        errorId: this.state.errorId,
        timestamp: new Date().toISOString(),
        message: error.message,
        name: error.name,
        stack: error.stack,
        componentStack: errorInfo.componentStack,
        userAgent: navigator.userAgent,
        url: window.location.href,
        retryCount: this.state.retryCount,
        appVersion: '1.0.0', // Get from package.json or environment
        userId: localStorage.getItem('userId') || 'anonymous',
        sessionId: sessionStorage.getItem('sessionId') || 'unknown',
        additionalInfo: {
          localStorageSize: this.getLocalStorageSize(),
          memoryUsage: this.getMemoryUsage(),
          connectionType: this.getConnectionType()
        }
      };

      const response = await fetch(this.errorReportingEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(errorReport)
      });

      if (response.ok) {
        if (process.env.NODE_ENV === 'development') {
          console.log('Error report sent successfully');
        }
      } else {
        throw new Error(`Report failed: ${response.status}`);
      }
    } catch (e) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Failed to report error:', e);
      }
    } finally {
      this.setState({ isReporting: false });
    }
  };

  private getLocalStorageSize = (): number => {
    try {
      return JSON.stringify(localStorage).length;
    } catch {
      return 0;
    }
  };

  private getMemoryUsage = (): any => {
    const memoryInfo = (performance as any).memory;
    if (memoryInfo) {
      return {
        used: Math.round(memoryInfo.usedJSHeapSize / 1024 / 1024),
        total: Math.round(memoryInfo.totalJSHeapSize / 1024 / 1024),
        limit: Math.round(memoryInfo.jsHeapSizeLimit / 1024 / 1024)
      };
    }
    return null;
  };

  private getConnectionType = (): string => {
    const connection = (navigator as any).connection;
    return connection ? connection.effectiveType || 'unknown' : 'unknown';
  };

  private handleRetry = () => {
    if (this.state.retryCount < this.maxRetries) {
      this.setState(prevState => ({
        hasError: false,
        error: null,
        errorInfo: null,
        retryCount: prevState.retryCount + 1
      }));
    } else {
      // Force page reload if max retries exceeded
      window.location.reload();
    }
  };

  private handleFullReload = () => {
    // Clear problematic data before reload
    try {
      sessionStorage.clear();
    } catch (e) {
      if (process.env.NODE_ENV === 'development') {
        console.warn('Could not clear session storage:', e);
      }
    }
    window.location.reload();
  };

  private copyErrorToClipboard = async () => {
    const { error, errorInfo, errorId } = this.state;
    
    const errorText = `
Error ID: ${errorId}
Message: ${error?.message}
Name: ${error?.name}
Stack: ${error?.stack}
Component Stack: ${errorInfo?.componentStack}
URL: ${window.location.href}
Time: ${new Date().toISOString()}
User Agent: ${navigator.userAgent}
    `.trim();

    try {
      await navigator.clipboard.writeText(errorText);
      if (process.env.NODE_ENV === 'development') {
        console.log('Error details copied to clipboard');
      }
    } catch (e) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Could not copy to clipboard:', e);
      }
    }
  };

  private toggleDetails = () => {
    this.setState(prevState => ({ showDetails: !prevState.showDetails }));
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      const { error, errorInfo, errorId, retryCount, isReporting, showDetails } = this.state;
      const canRetry = retryCount < this.maxRetries;

      return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-muted/30">
          <Card className="w-full max-w-2xl">
            <CardHeader>
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-6 w-6 text-destructive" />
                <div>
                  <CardTitle className="text-destructive">Xəta baş verdi</CardTitle>
                  <CardDescription>
                    Tətbiqdə gözlənilməz xəta baş verdi
                  </CardDescription>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              <Alert variant="destructive">
                <Bug className="h-4 w-4" />
                <AlertDescription>
                  <strong>Xəta mesajı:</strong> {error?.message || 'Naməlum xəta'}
                </AlertDescription>
              </Alert>

              <div className="flex items-center gap-2">
                <Badge variant="outline">ID: {errorId}</Badge>
                <Badge variant="secondary">Cəhd: {retryCount + 1}/{this.maxRetries + 1}</Badge>
                {isReporting && <Badge variant="default">Xəta həsabatı göndərilir...</Badge>}
              </div>

              {/* Action buttons */}
              <div className="flex flex-wrap gap-2">
                {canRetry ? (
                  <Button onClick={this.handleRetry} className="flex items-center gap-2">
                    <RefreshCw className="h-4 w-4" />
                    Yenidən cəhd et
                  </Button>
                ) : (
                  <Button onClick={this.handleFullReload} variant="destructive" className="flex items-center gap-2">
                    <RefreshCw className="h-4 w-4" />
                    Səhifəni yenilə
                  </Button>
                )}

                <Button variant="outline" onClick={this.copyErrorToClipboard} className="flex items-center gap-2">
                  <Copy className="h-4 w-4" />
                  Xətanı kopyala
                </Button>

                {this.props.enableReporting && !isReporting && (
                  <Button 
                    variant="outline" 
                    onClick={() => this.reportError(error!, errorInfo!)}
                    className="flex items-center gap-2"
                  >
                    <Send className="h-4 w-4" />
                    Hesabat göndər
                  </Button>
                )}
              </div>

              {/* Error details (collapsible) */}
              <Collapsible open={showDetails} onOpenChange={this.toggleDetails}>
                <CollapsibleTrigger asChild>
                  <Button variant="ghost" className="flex items-center gap-2 w-full justify-between">
                    <span>Təfərrüatlar</span>
                    <ChevronDown className={`h-4 w-4 transition-transform ${showDetails ? 'rotate-180' : ''}`} />
                  </Button>
                </CollapsibleTrigger>
                
                <CollapsibleContent className="space-y-2">
                  <div className="p-3 bg-muted rounded-md">
                    <h4 className="font-medium mb-2">Stack Trace:</h4>
                    <pre className="text-xs overflow-auto whitespace-pre-wrap">
                      {error?.stack}
                    </pre>
                  </div>
                  
                  {errorInfo && (
                    <div className="p-3 bg-muted rounded-md">
                      <h4 className="font-medium mb-2">Component Stack:</h4>
                      <pre className="text-xs overflow-auto whitespace-pre-wrap">
                        {errorInfo.componentStack}
                      </pre>
                    </div>
                  )}
                </CollapsibleContent>
              </Collapsible>

              {/* Help text */}
              <div className="text-sm text-muted-foreground">
                <p>Əgər problem davam edərsə:</p>
                <ul className="list-disc list-inside mt-1 space-y-1">
                  <li>Brauzer cache-ini təmizləyin</li>
                  <li>Fərqli brauzerdə yoxlayın</li>
                  <li>İnternet bağlantınızı yoxlayın</li>
                  <li>Texniki dəstək ilə əlaqə saxlayın</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

export { EnhancedErrorBoundary };
