import { useEffect, useState } from "react";
import { AlertTriangle, CheckCircle, Info } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface AccessibilityIssue {
  type: 'error' | 'warning' | 'info';
  message: string;
  element?: string;
  count?: number;
}

export function useAccessibilityChecker() {
  const [issues, setIssues] = useState<AccessibilityIssue[]>([]);

  useEffect(() => {
    const checkAccessibility = () => {
      const foundIssues: AccessibilityIssue[] = [];

      // Check for images without alt text
      const images = document.querySelectorAll('img:not([alt])');
      if (images.length > 0) {
        foundIssues.push({
          type: 'error',
          message: `${images.length} şəkil alt text olmadan`,
          element: 'img',
          count: images.length
        });
      }

      // Check for buttons without accessible names
      const buttons = document.querySelectorAll('button:not([aria-label]):not([title])');
      const buttonsWithoutText = Array.from(buttons).filter(btn => 
        !btn.textContent?.trim()
      );
      if (buttonsWithoutText.length > 0) {
        foundIssues.push({
          type: 'warning',
          message: `${buttonsWithoutText.length} button əlçatımlı ad olmadan`,
          element: 'button',
          count: buttonsWithoutText.length
        });
      }

      // Check for form inputs without labels
      const inputs = document.querySelectorAll('input:not([aria-label]):not([aria-labelledby])');
      const inputsWithoutLabels = Array.from(inputs).filter(input => {
        const id = input.getAttribute('id');
        return !id || !document.querySelector(`label[for="${id}"]`);
      });
      if (inputsWithoutLabels.length > 0) {
        foundIssues.push({
          type: 'error',
          message: `${inputsWithoutLabels.length} giriş sahəsi label olmadan`,
          element: 'input',
          count: inputsWithoutLabels.length
        });
      }

      // Check for missing heading structure
      const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
      if (headings.length === 0) {
        foundIssues.push({
          type: 'info',
          message: 'Səhifədə başlıq strukturu yoxdur',
          element: 'heading'
        });
      }

      // Check for missing skip links
      const skipLinks = document.querySelectorAll('a[href="#main-content"], a[href="#navigation"]');
      if (skipLinks.length === 0) {
        foundIssues.push({
          type: 'info',
          message: 'Skip navigation linkləri tapılmadı',
          element: 'skip-link'
        });
      }

      // Check for missing main landmark
      const mainLandmark = document.querySelector('main, [role="main"]');
      if (!mainLandmark) {
        foundIssues.push({
          type: 'warning',
          message: 'Ana məzmun sahəsi (main) tapılmadı',
          element: 'main'
        });
      }

      // Check color contrast (simplified)
      const lowContrastElements = document.querySelectorAll('[style*="color"]');
      if (lowContrastElements.length > 0) {
        foundIssues.push({
          type: 'info',
          message: 'Rəng kontrastını yoxlayın',
          element: 'color-contrast'
        });
      }

      setIssues(foundIssues);
    };

    // Check immediately and then every 5 seconds
    checkAccessibility();
    const interval = setInterval(checkAccessibility, 5000);

    return () => clearInterval(interval);
  }, []);

  return issues;
}

// Development-only accessibility checker overlay
export function AccessibilityOverlay() {
  const issues = useAccessibilityChecker();
  const [showDetails, setShowDetails] = useState(false);

  // Only show in development
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  const errorCount = issues.filter(i => i.type === 'error').length;
  const warningCount = issues.filter(i => i.type === 'warning').length;
  const infoCount = issues.filter(i => i.type === 'info').length;

  const getStatusColor = () => {
    if (errorCount > 0) return 'bg-destructive text-destructive-foreground';
    if (warningCount > 0) return 'bg-warning text-warning-foreground';
    return 'bg-success text-success-foreground';
  };

  const getStatusIcon = () => {
    if (errorCount > 0) return <AlertTriangle className="h-4 w-4" />;
    if (warningCount > 0) return <AlertTriangle className="h-4 w-4" />;
    return <CheckCircle className="h-4 w-4" />;
  };

  return (
    <div className="fixed bottom-16 right-4 z-50">
      <Button
        onClick={() => setShowDetails(!showDetails)}
        className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium ${getStatusColor()}`}
        aria-label={`Əlçatımlılıq: ${errorCount} xəta, ${warningCount} xəbərdarlıq, ${infoCount} məlumat`}
      >
        {getStatusIcon()}
        A11y ({issues.length})
      </Button>

      {showDetails && (
        <Card className="absolute bottom-12 right-0 w-80 max-h-60 overflow-auto">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <CheckCircle className="h-4 w-4" />
              Əlçatımlılıq Yoxlaması
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {issues.length === 0 ? (
              <p className="text-sm text-muted-foreground">Heç bir problem tapılmadı!</p>
            ) : (
              issues.map((issue, index) => (
                <Alert 
                  key={`accessibility-issue-${issue.type}-${index}`}
                  variant={issue.type === 'error' ? 'destructive' : 'default'}
                  className="text-sm"
                >
                  {issue.type === 'error' ? (
                    <AlertTriangle className="h-4 w-4" />
                  ) : issue.type === 'warning' ? (
                    <AlertTriangle className="h-4 w-4" />
                  ) : (
                    <Info className="h-4 w-4" />
                  )}
                  <AlertDescription>
                    {issue.message}
                    {issue.element && (
                      <span className="block text-xs opacity-75 mt-1">
                        Element: {issue.element}
                      </span>
                    )}
                  </AlertDescription>
                </Alert>
              ))
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}