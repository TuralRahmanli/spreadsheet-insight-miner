import { useState, useEffect } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Wifi, WifiOff } from "lucide-react";

export function NetworkStatus() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showOfflineAlert, setShowOfflineAlert] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setShowOfflineAlert(false);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowOfflineAlert(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Auto-hide offline alert after 10 seconds
    let timeoutId: NodeJS.Timeout;
    if (!isOnline) {
      timeoutId = setTimeout(() => {
        setShowOfflineAlert(false);
      }, 10000);
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [isOnline]);

  if (!showOfflineAlert) return null;

  return (
    <div className="fixed top-4 right-4 z-50 w-80">
      <Alert variant="destructive">
        <WifiOff className="h-4 w-4" />
        <AlertDescription className="flex items-center justify-between">
          <span>İnternet bağlantısı yoxdur</span>
          <button 
            onClick={() => setShowOfflineAlert(false)}
            className="text-destructive-foreground hover:text-destructive-foreground/80"
            aria-label="Xəbərdarlığı bağla"
          >
            ×
          </button>
        </AlertDescription>
      </Alert>
    </div>
  );
}