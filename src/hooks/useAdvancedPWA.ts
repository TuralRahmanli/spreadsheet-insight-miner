import { useState, useEffect, useCallback, useRef } from 'react';
import { toast } from '@/hooks/use-toast';

interface PWAInstallPrompt {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

interface ShareData {
  title?: string;
  text?: string;
  url?: string;
  files?: File[];
}

interface PWACapabilities {
  canInstall: boolean;
  isInstalled: boolean;
  canShare: boolean;
  canShareFiles: boolean;
  supportsBackgroundSync: boolean;
  supportsNotifications: boolean;
  supportsBadging: boolean;
  supportsScreenWakeLock: boolean;
}

export function useAdvancedPWA() {
  const [installPrompt, setInstallPrompt] = useState<PWAInstallPrompt | null>(null);
  const [isInstalling, setIsInstalling] = useState(false);
  const [capabilities, setCapabilities] = useState<PWACapabilities>({
    canInstall: false,
    isInstalled: false,
    canShare: false,
    canShareFiles: false,
    supportsBackgroundSync: false,
    supportsNotifications: false,
    supportsBadging: false,
    supportsScreenWakeLock: false
  });
  
  const [appBadge, setAppBadge] = useState(0);
  const [isBackgroundSyncEnabled, setIsBackgroundSyncEnabled] = useState(false);
  const wakeLockRef = useRef<WakeLockSentinel | null>(null);

  // Check PWA capabilities
  useEffect(() => {
    const checkCapabilities = () => {
      const newCapabilities: PWACapabilities = {
        canInstall: installPrompt !== null,
        isInstalled: window.matchMedia('(display-mode: standalone)').matches || 
                    (window.navigator as any).standalone === true,
        canShare: 'share' in navigator,
        canShareFiles: 'canShare' in navigator,
        supportsBackgroundSync: 'serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype,
        supportsNotifications: 'Notification' in window,
        supportsBadging: 'setAppBadge' in navigator,
        supportsScreenWakeLock: 'wakeLock' in navigator
      };

      setCapabilities(newCapabilities);
    };

    checkCapabilities();
  }, [installPrompt]);

  // Listen for install prompt
  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e as any);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  // Install PWA
  const installPWA = useCallback(async () => {
    if (!installPrompt) {
      toast({
        title: "Quraşdırma mümkün deyil",
        description: "Tətbiq artıq quraşdırılıb və ya quraşdırma dəstəklənmir",
        variant: "destructive"
      });
      return false;
    }

    setIsInstalling(true);

    try {
      await installPrompt.prompt();
      const choice = await installPrompt.userChoice;
      
      if (choice.outcome === 'accepted') {
        setInstallPrompt(null);
        toast({
          title: "Tətbiq quraşdırıldı",
          description: "Tətbiq uğurla quraşdırıldı və ana ekranda əlçatandır",
        });
        return true;
      } else {
        toast({
          title: "Quraşdırma ləğv edildi",
          description: "İstifadəçi tərəfindən quraşdırma ləğv edildi",
        });
        return false;
      }
    } catch (error) {
      console.error('Installation failed:', error);
      toast({
        title: "Quraşdırma xətası",
        description: "Tətbiq quraşdırılarkən xəta baş verdi",
        variant: "destructive"
      });
      return false;
    } finally {
      setIsInstalling(false);
    }
  }, [installPrompt]);

  // Share content
  const shareContent = useCallback(async (shareData: ShareData) => {
    if (!capabilities.canShare) {
      // Fallback to clipboard
      try {
        const textToShare = `${shareData.title || ''}\n${shareData.text || ''}\n${shareData.url || ''}`.trim();
        await navigator.clipboard.writeText(textToShare);
        toast({
          title: "Klipborda kopyalandı",
          description: "Məzmun klipborda kopyalandı",
        });
        return true;
      } catch (error) {
        toast({
          title: "Paylaşma xətası",
          description: "Məzmun paylaşıla bilmədi",
          variant: "destructive"
        });
        return false;
      }
    }

    try {
      // Check if we can share files
      if (shareData.files && capabilities.canShareFiles) {
        const canShareFiles = await (navigator as any).canShare?.(shareData);
        if (!canShareFiles) {
          // Remove files and try again
          const { files, ...dataWithoutFiles } = shareData;
          await navigator.share(dataWithoutFiles);
        } else {
          await navigator.share(shareData);
        }
      } else {
        const { files, ...dataWithoutFiles } = shareData;
        await navigator.share(dataWithoutFiles);
      }

      toast({
        title: "Məzmun paylaşıldı",
        description: "Məzmun uğurla paylaşıldı",
      });
      return true;
    } catch (error) {
      if ((error as Error).name === 'AbortError') {
        toast({
          title: "Paylaşma ləğv edildi",
          description: "İstifadəçi tərəfindən paylaşma ləğv edildi",
        });
      } else {
        toast({
          title: "Paylaşma xətası",
          description: "Məzmun paylaşılarkən xəta baş verdi",
          variant: "destructive"
        });
      }
      return false;
    }
  }, [capabilities.canShare, capabilities.canShareFiles]);

  // Request notification permission
  const requestNotificationPermission = useCallback(async () => {
    if (!capabilities.supportsNotifications) {
      return 'denied';
    }

    try {
      const permission = await Notification.requestPermission();
      
      if (permission === 'granted') {
        toast({
          title: "Bildiriş icazəsi verildi",
          description: "İndi sizə bildirişlər göndərə bilərik",
        });
      } else if (permission === 'denied') {
        toast({
          title: "Bildiriş icazəsi rədd edildi",
          description: "Bildirişlər brauzer parametrlərindən aktiv edilə bilər",
          variant: "destructive"
        });
      }

      return permission;
    } catch (error) {
      console.error('Notification permission error:', error);
      return 'denied';
    }
  }, [capabilities.supportsNotifications]);

  // Send notification
  const sendNotification = useCallback(async (title: string, options?: NotificationOptions) => {
    if (!capabilities.supportsNotifications || Notification.permission !== 'granted') {
      return false;
    }

    try {
      const notification = new Notification(title, {
        icon: '/icon-192x192.png',
        badge: '/icon-192x192.png',
        ...options
      });

      // Auto-close after 5 seconds if not interacted with
      setTimeout(() => notification.close(), 5000);

      return true;
    } catch (error) {
      console.error('Notification error:', error);
      return false;
    }
  }, [capabilities.supportsNotifications]);

  // Set app badge
  const setAppBadgeCount = useCallback(async (count: number) => {
    if (!capabilities.supportsBadging) {
      return false;
    }

    try {
      if (count > 0) {
        await (navigator as any).setAppBadge(count);
      } else {
        await (navigator as any).clearAppBadge();
      }
      setAppBadge(count);
      return true;
    } catch (error) {
      console.error('App badge error:', error);
      return false;
    }
  }, [capabilities.supportsBadging]);

  // Screen wake lock
  const requestWakeLock = useCallback(async () => {
    if (!capabilities.supportsScreenWakeLock) {
      toast({
        title: "Wake Lock dəstəklənmir",
        description: "Bu cihazda ekran wake lock dəstəklənmir",
        variant: "destructive"
      });
      return false;
    }

    try {
      wakeLockRef.current = await (navigator as any).wakeLock.request('screen');
      
      wakeLockRef.current.addEventListener('release', () => {
        console.log('Screen Wake Lock released');
      });

      toast({
        title: "Ekran aktiv saxlanıldı",
        description: "Ekran söndürülməyəcək",
      });

      return true;
    } catch (error) {
      console.error('Wake lock error:', error);
      toast({
        title: "Wake Lock xətası",
        description: "Ekran wake lock aktivləşdirilə bilmədi",
        variant: "destructive"
      });
      return false;
    }
  }, [capabilities.supportsScreenWakeLock]);

  // Release wake lock
  const releaseWakeLock = useCallback(() => {
    if (wakeLockRef.current) {
      wakeLockRef.current.release();
      wakeLockRef.current = null;
      
      toast({
        title: "Ekran wake lock sərbəst buraxıldı",
        description: "Ekran normal rejimə qayıtdı",
      });
    }
  }, []);

  // Register background sync
  const registerBackgroundSync = useCallback(async (tag: string) => {
    if (!capabilities.supportsBackgroundSync) {
      return false;
    }

    try {
      const registration = await navigator.serviceWorker.ready;
      await (registration as any).sync.register(tag); // ServiceWorkerRegistration with sync
      setIsBackgroundSyncEnabled(true);
      
      toast({
        title: "Background Sync qeydə alındı",
        description: "Offline əməliyyatlar avtomatik sinxronlaşacaq",
      });

      return true;
    } catch (error) {
      console.error('Background sync registration error:', error);
      return false;
    }
  }, [capabilities.supportsBackgroundSync]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      releaseWakeLock();
    };
  }, [releaseWakeLock]);

  return {
    capabilities,
    installPrompt,
    isInstalling,
    appBadge,
    isBackgroundSyncEnabled,
    
    // Actions
    installPWA,
    shareContent,
    requestNotificationPermission,
    sendNotification,
    setAppBadgeCount,
    requestWakeLock,
    releaseWakeLock,
    registerBackgroundSync,
    
    // State
    isWakeLockActive: wakeLockRef.current !== null
  };
}