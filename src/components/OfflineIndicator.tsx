import { useOfflineQueue } from "@/hooks/useOfflineQueue";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { WifiOff, RefreshCw, CheckCircle } from "lucide-react";

export function OfflineIndicator() {
  const { isOnline, pendingCount, triggerSync } = useOfflineQueue();

  if (isOnline && pendingCount === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 w-80">
      <Alert variant={isOnline ? "default" : "destructive"}>
        {isOnline ? (
          <CheckCircle className="h-4 w-4" />
        ) : (
          <WifiOff className="h-4 w-4" />
        )}
        <AlertDescription className="flex items-center justify-between">
          <div>
            {isOnline ? (
              <span>{pendingCount} əməliyyat sinxronlaşdırılır</span>
            ) : (
              <span>Offline rejim - {pendingCount} əməliyyat növbədə</span>
            )}
          </div>
          {isOnline && pendingCount > 0 && (
            <Button
              size="sm"
              variant="outline"
              onClick={triggerSync}
              className="ml-2"
            >
              <RefreshCw className="h-3 w-3" />
            </Button>
          )}
        </AlertDescription>
      </Alert>
    </div>
  );
}