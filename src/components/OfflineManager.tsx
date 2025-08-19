import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Wifi, 
  WifiOff, 
  RefreshCw, 
  Clock, 
  CheckCircle, 
  AlertTriangle,
  X
} from "lucide-react";
import { useOfflineQueue } from "@/hooks/useOfflineQueue";
import { toast } from "@/hooks/use-toast";

interface OfflineAction {
  id: string;
  type: string;
  data: any;
  timestamp: number;
  status: 'pending' | 'syncing' | 'failed' | 'success';
  retryCount?: number;
}

export function OfflineManager() {
  const { queue, isOnline, pendingCount, triggerSync } = useOfflineQueue();
  const [isVisible, setIsVisible] = useState(false);
  const [syncProgress, setSyncProgress] = useState(0);
  const [failedActions, setFailedActions] = useState<OfflineAction[]>([]);

  useEffect(() => {
    // Show offline manager when there are pending actions or when offline
    setIsVisible(!isOnline || pendingCount > 0);
  }, [isOnline, pendingCount]);

  useEffect(() => {
      // Monitor sync progress (simulated for now)
      if (queue.length > 0) {
        // For now, simulate progress since we don't have actual sync status
        setSyncProgress(50); // Mock progress
        
        // Track failed actions
        const failed = queue.filter(action => action.status === 'failed');
        setFailedActions(failed);
      }
  }, [queue]);

  const handleRetryFailed = () => {
    failedActions.forEach(action => {
      // Reset status and trigger sync
      action.status = 'pending';
      triggerSync();
    });
    
    toast({
      title: "Yenidən cəhd edilir",
      description: `${failedActions.length} əməliyyat yenidən sinxronlaşdırılır`,
    });
  };

  const clearSuccessful = () => {
    // This would typically be handled by the queue system
    toast({
      title: "Təmizləndi",
      description: "Uğurlu əməliyyatlar siyahıdan silindi",
    });
  };

  const getActionDescription = (action: OfflineAction) => {
    switch (action.type) {
      case 'ADD_PRODUCT':
        return `Məhsul əlavə edildi: ${action.data.name}`;
      case 'UPDATE_PRODUCT':
        return `Məhsul yeniləndi: ${action.data.name}`;
      case 'DELETE_PRODUCT':
        return `Məhsul silindi`;
      case 'ADD_OPERATION':
        return `${action.data.type} əməliyyatı`;
      default:
        return `${action.type} əməliyyatı`;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4 text-warning" />;
      case 'syncing':
        return <RefreshCw className="h-4 w-4 text-primary animate-spin" />;
      case 'success':
        return <CheckCircle className="h-4 w-4 text-success" />;
      case 'failed':
        return <AlertTriangle className="h-4 w-4 text-destructive" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-4 left-4 z-50 w-80">
      <Card className="border-l-4 border-l-primary">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2">
              {isOnline ? (
                <Wifi className="h-4 w-4 text-success" />
              ) : (
                <WifiOff className="h-4 w-4 text-destructive" />
              )}
              Offline İdarəetməsi
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsVisible(false)}
              className="h-6 w-6 p-0"
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Connection Status */}
          <div className="flex items-center justify-between">
            <span className="text-sm">Status:</span>
            <Badge variant={isOnline ? "default" : "destructive"}>
              {isOnline ? "Online" : "Offline"}
            </Badge>
          </div>

          {/* Pending Actions Count */}
          {pendingCount > 0 && (
            <div className="flex items-center justify-between">
              <span className="text-sm">Gözləyən əməliyyatlar:</span>
              <Badge variant="secondary">{pendingCount}</Badge>
            </div>
          )}

          {/* Sync Progress */}
          {queue.length > 0 && syncProgress > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm">Sinxronlaşma:</span>
                <span className="text-sm">{Math.round(syncProgress)}%</span>
              </div>
              <Progress value={syncProgress} className="h-2" />
            </div>
          )}

          {/* Actions List */}
          <div className="space-y-2 max-h-40 overflow-auto">
            {queue.slice(0, 5).map((action) => (
              <div key={action.id} className="flex items-center gap-2 text-xs">
                {getStatusIcon(action.status)}
                <span className="flex-1 truncate">
                  {getActionDescription(action)}
                </span>
                <span className="text-muted-foreground">
                  {new Date(action.timestamp).toLocaleTimeString('az-AZ')}
                </span>
              </div>
            ))}
            
            {queue.length > 5 && (
              <p className="text-xs text-muted-foreground text-center">
                +{queue.length - 5} digər əməliyyat
              </p>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            {isOnline && pendingCount > 0 && (
              <Button size="sm" onClick={triggerSync} className="flex-1">
                <RefreshCw className="mr-1 h-3 w-3" />
                Sinxronlaşdır
              </Button>
            )}
            
            {failedActions.length > 0 && (
              <Button 
                size="sm" 
                variant="outline" 
                onClick={handleRetryFailed}
                className="flex-1"
              >
                Yenidən cəhd
              </Button>
            )}
            
            {failedActions.length > 0 && (
              <Button 
                size="sm" 
                variant="outline" 
                onClick={handleRetryFailed}
                className="flex-1"
              >
                Yenidən cəhd
              </Button>
            )}
          </div>

          {/* Offline Message */}
          {!isOnline && (
            <div className="text-xs text-muted-foreground bg-muted p-2 rounded">
              İnternet bağlantısı bərpa olanda bütün əməliyyatlar avtomatik sinxronlaşdırılacaq.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}