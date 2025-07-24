import { useEffect, useState } from "react";
import { AlertTriangle, CheckCircle, Info } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface AccessibilityIssue {
  type: 'error' | 'warning' | 'info';
  message: string;
  element?: string;
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
          element: 'img'
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
          element: 'button'
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
          element: 'input'
        });
      }

      // Check color contrast (basic check)
      const elements = document.querySelectorAll('*');
      let lowContrastCount = 0;
      
      Array.from(elements).forEach(el => {
        if (el.children.length === 0 && el.textContent?.trim()) {
          const style = window.getComputedStyle(el);
          const bgColor = style.backgroundColor;
          const textColor = style.color;
          
          // Simple contrast check (this is a basic implementation)
          if (bgColor === textColor) {
            lowContrastCount++;
          }
        }
      });

      if (lowContrastCount > 0) {
        foundIssues.push({
          type: 'warning',
          message: `${lowContrastCount} element potensial kontrast problemi`,
          element: 'contrast'
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

      setIssues(foundIssues);
    };

    // Check immediately and then periodically
    checkAccessibility();
    const interval = setInterval(checkAccessibility, 5000);

    return () => clearInterval(interval);
  }, []);

  return issues;
}

// Development-only accessibility checker overlay
export function AccessibilityOverlay() {
  const issues = useAccessibilityChecker();
  const [showIssues, setShowIssues] = useState(false);

  // Only show in development
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  const errorCount = issues.filter(i => i.type === 'error').length;
  const warningCount = issues.filter(i => i.type === 'warning').length;

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <button
        onClick={() => setShowIssues(!showIssues)}
        aria-label={`Əlçatımlılıq xətaları: ${issues.length} məsələ`}
        className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
          errorCount > 0 
            ? 'bg-destructive text-destructive-foreground' 
            : warningCount > 0 
            ? 'bg-warning text-warning-foreground'
            : 'bg-success text-success-foreground'
        }`}
      >
        {errorCount > 0 ? (
          <AlertTriangle className="h-4 w-4" />
        ) : (
          <CheckCircle className="h-4 w-4" />
        )}
        A11y ({issues.length})
      </button>

      {showIssues && issues.length > 0 && (
        <div className="absolute bottom-12 right-0 w-80 max-h-60 overflow-auto space-y-2">
           {issues.map((issue, index) => (
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
          ))}
        </div>
      )}
    </div>
  );
}