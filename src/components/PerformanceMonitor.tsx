import { useEffect, useState } from "react";

interface PerformanceData {
  renderTime: number;
  memoryUsage?: number;
  fps: number;
}

export function usePerformanceMonitor() {
  const [performanceData, setPerformanceData] = useState<PerformanceData>({
    renderTime: 0,
    fps: 0
  });

  useEffect(() => {
    let frameCount = 0;
    let lastTime = performance.now();
    let animationId: number;

    const measureFPS = () => {
      frameCount++;
      const currentTime = performance.now();
      
      if (currentTime >= lastTime + 1000) {
        const fps = Math.round((frameCount * 1000) / (currentTime - lastTime));
        
        setPerformanceData(prev => ({
          ...prev,
          fps,
          memoryUsage: (performance as Performance & { memory?: { usedJSHeapSize: number } }).memory?.usedJSHeapSize || 0
        }));

        frameCount = 0;
        lastTime = currentTime;
      }
      
      animationId = requestAnimationFrame(measureFPS);
    };

    // Start measuring performance
    const startTime = performance.now();
    animationId = requestAnimationFrame(measureFPS);

    // Measure initial render time
    requestAnimationFrame(() => {
      const endTime = performance.now();
      setPerformanceData(prev => ({
        ...prev,
        renderTime: endTime - startTime
      }));
    });

    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }, []);

  return performanceData;
}

// Development-only performance overlay
export function PerformanceOverlay() {
  const performanceData = usePerformanceMonitor();

  // Only show in development
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 z-50 bg-background/90 backdrop-blur-sm border rounded-lg p-2 text-xs font-mono">
      <div>FPS: {performanceData.fps}</div>
      <div>Render: {performanceData.renderTime.toFixed(2)}ms</div>
      {performanceData.memoryUsage && (
        <div>Memory: {(performanceData.memoryUsage / 1024 / 1024).toFixed(1)}MB</div>
      )}
    </div>
  );
}