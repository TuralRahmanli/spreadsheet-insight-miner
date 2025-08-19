import { useEffect, useRef, useState, useCallback } from "react";
import { Camera, X, FlashlightIcon, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "@/hooks/use-toast";

interface BarcodeScannerProps {
  isOpen: boolean;
  onClose: () => void;
  onScan: (code: string, type: string) => void;
}

export function BarcodeScanner({ isOpen, onClose, onScan }: BarcodeScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentCamera, setCurrentCamera] = useState<'user' | 'environment'>('environment');
  const [flashEnabled, setFlashEnabled] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Cleanup stream
  const stopStream = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => {
        track.stop();
      });
      streamRef.current = null;
    }
  }, []);

  // Start camera stream
  const startCamera = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Stop existing stream
      stopStream();

      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: currentCamera,
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        setIsScanning(true);
      }
    } catch (err) {
      console.error('Camera access error:', err);
      setError('Kameraya çıxış olmadı. Zəhmət olmasa icazə verin və ya başqa cihazdan yoxlayın.');
    } finally {
      setIsLoading(false);
    }
  }, [currentCamera, stopStream]);

  // Toggle flash (if supported)
  const toggleFlash = useCallback(async () => {
    if (streamRef.current) {
      const track = streamRef.current.getVideoTracks()[0];
      const capabilities = track.getCapabilities?.() as any;
      
      if (capabilities && 'torch' in capabilities) {
        try {
          await track.applyConstraints({
            advanced: [{ torch: !flashEnabled } as any]
          });
          setFlashEnabled(!flashEnabled);
        } catch (err) {
          toast({
            title: "Flash dəstəklənmir",
            description: "Bu cihazda flash funksiyası yoxdur",
            variant: "destructive"
          });
        }
      } else {
        toast({
          title: "Flash dəstəklənmir",
          description: "Bu cihazda flash funksiyası yoxdur",
          variant: "destructive"
        });
      }
    }
  }, [flashEnabled]);

  // Switch between front and back camera
  const switchCamera = useCallback(() => {
    setCurrentCamera(prev => prev === 'user' ? 'environment' : 'user');
  }, []);

  // Barcode detection (simplified - in real app you'd use a library like ZXing)
  const detectBarcode = useCallback(() => {
    if (!videoRef.current || !canvasRef.current || !isScanning) return;

    const canvas = canvasRef.current;
    const video = videoRef.current;
    const ctx = canvas.getContext('2d');

    if (!ctx) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0);

    // Simulate barcode detection (in real app, use proper barcode library)
    // This is a placeholder that detects mock barcodes for demo
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    
    // Mock detection for demo - you should integrate with a real barcode library
    if (Math.random() < 0.1) { // 10% chance to simulate detection
      const mockCodes = [
        '1234567890123',
        '9876543210987',
        'ABC123DEF456',
        'TEST-PRODUCT-001'
      ];
      const randomCode = mockCodes[Math.floor(Math.random() * mockCodes.length)];
      
      onScan(randomCode, 'EAN-13');
      setIsScanning(false);
      onClose();
      
      toast({
        title: "Barkod oxundu",
        description: `Kod: ${randomCode}`,
      });
    }
  }, [isScanning, onScan, onClose]);

  // Start scanning loop
  useEffect(() => {
    if (!isScanning) return;

    const interval = setInterval(detectBarcode, 500);
    return () => clearInterval(interval);
  }, [isScanning, detectBarcode]);

  // Initialize camera when dialog opens
  useEffect(() => {
    if (isOpen && !error) {
      startCamera();
    }
    
    return () => {
      if (!isOpen) {
        stopStream();
        setIsScanning(false);
        setError(null);
      }
    };
  }, [isOpen, startCamera, stopStream, error]);

  // Check camera permission and availability
  const checkCameraSupport = useCallback(() => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setError('Kamera bu cihazda dəstəklənmir');
      return false;
    }
    return true;
  }, []);

  useEffect(() => {
    if (isOpen) {
      checkCameraSupport();
    }
  }, [isOpen, checkCameraSupport]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md w-full">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Camera className="h-5 w-5" />
            Barkod / QR Kod Oxuyucu
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {error ? (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : (
            <div className="relative">
              {/* Video Preview */}
              <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
                <video
                  ref={videoRef}
                  className="w-full h-full object-cover"
                  autoPlay
                  playsInline
                  muted
                />
                
                {/* Scanning Overlay */}
                {isScanning && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="border-2 border-primary w-48 h-32 animate-pulse">
                      <div className="absolute top-0 left-0 w-4 h-4 border-l-4 border-t-4 border-primary"></div>
                      <div className="absolute top-0 right-0 w-4 h-4 border-r-4 border-t-4 border-primary"></div>
                      <div className="absolute bottom-0 left-0 w-4 h-4 border-l-4 border-b-4 border-primary"></div>
                      <div className="absolute bottom-0 right-0 w-4 h-4 border-r-4 border-b-4 border-primary"></div>
                    </div>
                  </div>
                )}

                {isLoading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                    <div className="text-white">Kamera açılır...</div>
                  </div>
                )}
              </div>

              {/* Hidden canvas for image processing */}
              <canvas ref={canvasRef} className="hidden" />

              {/* Controls */}
              <div className="flex justify-center gap-2 mt-4">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={toggleFlash}
                  title="Flash aç/bağla"
                >
                  <FlashlightIcon className={`h-4 w-4 ${flashEnabled ? 'text-yellow-500' : ''}`} />
                </Button>

                <Button
                  variant="outline"
                  size="icon"
                  onClick={switchCamera}
                  title="Kameranı dəyiş"
                >
                  <RotateCcw className="h-4 w-4" />
                </Button>

                <Button
                  variant="outline"
                  onClick={() => {
                    setIsScanning(false);
                    onClose();
                  }}
                  title="Bağla"
                >
                  <X className="h-4 w-4" />
                  İmtina
                </Button>
              </div>
            </div>
          )}

          {/* Instructions */}
          <div className="text-center text-sm text-muted-foreground">
            Barkodu və ya QR kodu kamera görüş sahəsində tutun
          </div>

          {/* Manual Input Fallback */}
          <div className="pt-2 border-t">
            <Button
              variant="link"
              className="w-full"
              onClick={() => {
                const code = prompt("Barkodu əl ilə daxil edin:");
                if (code) {
                  onScan(code, 'MANUAL');
                  onClose();
                }
              }}
            >
              Əl ilə daxil et
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}