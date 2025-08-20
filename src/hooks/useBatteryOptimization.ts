import { useState, useEffect, useCallback, useRef } from 'react';
import { toast } from '@/hooks/use-toast';

interface BatteryInfo {
  level: number;
  charging: boolean;
  chargingTime: number;
  dischargingTime: number;
}

interface BatteryOptimizationConfig {
  lowBatteryThreshold: number;
  criticalBatteryThreshold: number;
  enablePowerSaver: boolean;
  enableAdaptiveBrightness: boolean;
  enableBackgroundSync: boolean;
  enableAnimations: boolean;
  enableAutoSleep: boolean;
  autoSleepDelay: number;
}

const DEFAULT_CONFIG: BatteryOptimizationConfig = {
  lowBatteryThreshold: 0.20, // 20%
  criticalBatteryThreshold: 0.10, // 10%
  enablePowerSaver: true,
  enableAdaptiveBrightness: true,
  enableBackgroundSync: true,
  enableAnimations: true,
  enableAutoSleep: true,
  autoSleepDelay: 300000 // 5 minutes
};

export function useBatteryOptimization(config: Partial<BatteryOptimizationConfig> = {}) {
  const finalConfig = { ...DEFAULT_CONFIG, ...config };
  
  const [batteryInfo, setBatteryInfo] = useState<BatteryInfo | null>(null);
  const [isSupported, setIsSupported] = useState(false);
  const [powerSaverMode, setPowerSaverMode] = useState(false);
  const [optimizationsActive, setOptimizationsActive] = useState<string[]>([]);
  
  const batteryRef = useRef<{
    level: number;
    charging: boolean;
    chargingTime: number;
    dischargingTime: number;
    addEventListener: (type: string, listener: EventListener) => void;
    removeEventListener: (type: string, listener: EventListener) => void;
  } | null>(null);
  const activityTimerRef = useRef<NodeJS.Timeout>();
  const lastActivityRef = useRef<number>(Date.now());
  
  // Check battery API support
  useEffect(() => {
    const checkBatterySupport = async () => {
      if ('getBattery' in navigator) {
        try {
          const battery = await (navigator as any).getBattery();
          batteryRef.current = battery;
          setIsSupported(true);
          
          // Initial battery info
          updateBatteryInfo(battery);
          
          // Set up battery event listeners with proper event handling
          const handleBatteryEvent = () => updateBatteryInfo(battery);
          
          battery.addEventListener('chargingchange', handleBatteryEvent);
          battery.addEventListener('levelchange', handleBatteryEvent);
          battery.addEventListener('chargingtimechange', handleBatteryEvent);
          battery.addEventListener('dischargingtimechange', handleBatteryEvent);
          
        } catch (error) {
          console.error('Battery API error:', error);
          setIsSupported(false);
        }
      } else {
        setIsSupported(false);
      }
    };

    checkBatterySupport();
  }, []);

  // Update battery information
  const updateBatteryInfo = useCallback((battery: typeof batteryRef.current) => {
    if (!battery) return;
    const info: BatteryInfo = {
      level: battery.level,
      charging: battery.charging,
      chargingTime: battery.chargingTime,
      dischargingTime: battery.dischargingTime
    };
    
    setBatteryInfo(info);
    
    // Check if we need to activate power saver mode
    if (finalConfig.enablePowerSaver && !info.charging) {
      if (info.level <= finalConfig.criticalBatteryThreshold && !powerSaverMode) {
        activatePowerSaverMode('critical');
      } else if (info.level <= finalConfig.lowBatteryThreshold && !powerSaverMode) {
        activatePowerSaverMode('low');
      } else if (info.level > finalConfig.lowBatteryThreshold && powerSaverMode) {
        deactivatePowerSaverMode();
      }
    }
  }, [finalConfig, powerSaverMode]);

  // Activate power saver mode
  const activatePowerSaverMode = useCallback((reason: 'low' | 'critical' | 'manual') => {
    setPowerSaverMode(true);
    const activeOptimizations: string[] = [];

    // Disable animations
    if (finalConfig.enableAnimations) {
      document.documentElement.style.setProperty('--animation-duration', '0s');
      document.documentElement.style.setProperty('--transition-duration', '0s');
      activeOptimizations.push('animations');
    }

    // Reduce refresh rates
    if (finalConfig.enableBackgroundSync) {
      // Signal to reduce background activity
      window.dispatchEvent(new CustomEvent('battery-optimization', {
        detail: { type: 'reduce-background-sync', active: true }
      }));
      activeOptimizations.push('background-sync');
    }

    // Auto-sleep functionality
    if (finalConfig.enableAutoSleep) {
      resetActivityTimer();
      activeOptimizations.push('auto-sleep');
    }

    setOptimizationsActive(activeOptimizations);

    const message = reason === 'critical' 
      ? 'Kritik batareya səviyyəsi: Güc qənaət rejimi aktivləşdirildi'
      : reason === 'low'
      ? 'Aşağı batareya səviyyəsi: Güc qənaət rejimi aktivləşdirildi'
      : 'Güc qənaət rejimi əl ilə aktivləşdirildi';

    toast({
      title: "Güc Qənaət Rejimi",
      description: message,
      variant: reason === 'critical' ? 'destructive' : 'default'
    });
  }, [finalConfig]);

  // Deactivate power saver mode
  const deactivatePowerSaverMode = useCallback(() => {
    setPowerSaverMode(false);
    
    // Restore animations
    document.documentElement.style.removeProperty('--animation-duration');
    document.documentElement.style.removeProperty('--transition-duration');

    // Restore background sync
    window.dispatchEvent(new CustomEvent('battery-optimization', {
      detail: { type: 'reduce-background-sync', active: false }
    }));

    // Clear auto-sleep
    if (activityTimerRef.current) {
      clearTimeout(activityTimerRef.current);
    }

    setOptimizationsActive([]);

    toast({
      title: "Normal Rejim",
      description: "Güc qənaət rejimi deaktivləşdirildi",
    });
  }, []);

  // Track user activity for auto-sleep
  const trackActivity = useCallback(() => {
    lastActivityRef.current = Date.now();
    if (powerSaverMode && finalConfig.enableAutoSleep) {
      resetActivityTimer();
    }
  }, [powerSaverMode, finalConfig.enableAutoSleep]);

  // Reset activity timer
  const resetActivityTimer = useCallback(() => {
    if (activityTimerRef.current) {
      clearTimeout(activityTimerRef.current);
    }

    activityTimerRef.current = setTimeout(() => {
      // Trigger sleep mode
      window.dispatchEvent(new CustomEvent('battery-optimization', {
        detail: { type: 'auto-sleep', active: true }
      }));
      
      toast({
        title: "Auto Yuxu Rejimi",
        description: "Aktivlik yoxdur, ekran qaraldır",
      });
    }, finalConfig.autoSleepDelay);
  }, [finalConfig.autoSleepDelay]);

  // Set up activity tracking
  useEffect(() => {
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    
    events.forEach(event => {
      document.addEventListener(event, trackActivity, { passive: true });
    });

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, trackActivity);
      });
      
      if (activityTimerRef.current) {
        clearTimeout(activityTimerRef.current);
      }
    };
  }, [trackActivity]);

  // Battery monitoring
  const getBatteryEstimate = useCallback(() => {
    if (!batteryInfo) return null;

    const { level, charging, dischargingTime } = batteryInfo;
    
    if (charging) {
      return {
        status: 'charging',
        timeRemaining: dischargingTime === Infinity ? 'Bilinmir' : `${Math.round(dischargingTime / 60)} dəqiqə`,
        recommendation: level < 0.8 ? 'Şarj davam edir' : 'Şarj tamam olmağa yaxındır'
      };
    }

    const hoursRemaining = dischargingTime / 3600;
    let recommendation = '';
    
    if (level < 0.1) {
      recommendation = 'Tez şarj edin!';
    } else if (level < 0.2) {
      recommendation = 'Güc qənaət rejimini aktiv edin';
    } else if (level < 0.5) {
      recommendation = 'Şarj etməyi planlaşdırın';
    } else {
      recommendation = 'Batareya səviyyəsi normal';
    }

    return {
      status: 'discharging',
      timeRemaining: hoursRemaining === Infinity 
        ? 'Bilinmir' 
        : `${Math.round(hoursRemaining)} saat`,
      recommendation
    };
  }, [batteryInfo]);

  // Performance monitoring for battery impact
  const monitorPerformanceImpact = useCallback(() => {
    if (!isSupported) return null;

    const now = performance.now();
    const memoryInfo = (performance as any).memory;
    
    return {
      cpuUsage: 'N/A', // Would need additional APIs
      memoryUsage: memoryInfo ? {
        used: Math.round(memoryInfo.usedJSHeapSize / 1024 / 1024),
        total: Math.round(memoryInfo.totalJSHeapSize / 1024 / 1024),
        limit: Math.round(memoryInfo.jsHeapSizeLimit / 1024 / 1024)
      } : null,
      renderTime: now,
      batteryImpact: powerSaverMode ? 'optimized' : 'normal'
    };
  }, [isSupported, powerSaverMode]);

  // Manual power saver toggle
  const togglePowerSaverMode = useCallback(() => {
    if (powerSaverMode) {
      deactivatePowerSaverMode();
    } else {
      activatePowerSaverMode('manual');
    }
  }, [powerSaverMode, activatePowerSaverMode, deactivatePowerSaverMode]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (activityTimerRef.current) {
        clearTimeout(activityTimerRef.current);
      }
      
      // Remove battery event listeners
      const battery = batteryRef.current;
      if (battery) {
        const handleBatteryEvent = () => updateBatteryInfo(battery);
        battery.removeEventListener('chargingchange', handleBatteryEvent);
        battery.removeEventListener('levelchange', handleBatteryEvent);
        battery.removeEventListener('chargingtimechange', handleBatteryEvent);
        battery.removeEventListener('dischargingtimechange', handleBatteryEvent);
      }
    };
  }, [updateBatteryInfo]);

  return {
    // State
    batteryInfo,
    isSupported,
    powerSaverMode,
    optimizationsActive,
    
    // Actions
    togglePowerSaverMode,
    activatePowerSaverMode,
    deactivatePowerSaverMode,
    
    // Utilities
    getBatteryEstimate,
    monitorPerformanceImpact,
    trackActivity,
    
    // Config
    config: finalConfig
  };
}