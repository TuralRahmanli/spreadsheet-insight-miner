import { useState, useCallback, useRef, useEffect } from 'react';
import { toast } from '@/hooks/use-toast';

interface BluetoothScannerOptions {
  onScan: (code: string, type: 'BLUETOOTH') => void;
  autoConnect?: boolean;
  filterServices?: string[];
}

interface BluetoothDevice {
  id: string;
  name: string;
  connected: boolean;
  device?: any; // Bluetooth device object
}

export function useBluetoothScanner({ onScan, autoConnect = false, filterServices }: BluetoothScannerOptions) {
  const [isSupported, setIsSupported] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [connectedDevice, setConnectedDevice] = useState<BluetoothDevice | null>(null);
  const [availableDevices, setAvailableDevices] = useState<BluetoothDevice[]>([]);
  const [isConnecting, setIsConnecting] = useState(false);
  const characteristicRef = useRef<any>(null); // BluetoothRemoteGATTCharacteristic
  const bufferRef = useRef<string>('');

  // Check Bluetooth support
  useEffect(() => {
    const checkSupport = () => {
      const supported = 'bluetooth' in navigator && 'requestDevice' in (navigator as any).bluetooth;
      setIsSupported(supported);
      
      if (!supported && process.env.NODE_ENV === 'development') {
        console.warn('Web Bluetooth API not supported in this browser');
      }
    };

    checkSupport();
  }, []);

  // Handle incoming data from Bluetooth device
  const handleCharacteristicValueChanged = useCallback((event: Event) => {
    const target = event.target as any; // BluetoothRemoteGATTCharacteristic
    const value = target.value;
    
    if (!value) return;

    // Convert ArrayBuffer to string
    const decoder = new TextDecoder();
    const data = decoder.decode(value);
    
    // Add to buffer
    bufferRef.current += data;
    
    // Check for complete barcode (usually ends with newline or carriage return)
    const lines = bufferRef.current.split(/[\r\n]+/);
    
    if (lines.length > 1) {
      const completeCode = lines[0].trim();
      bufferRef.current = lines[lines.length - 1]; // Keep incomplete line
      
      if (completeCode) {
        // Filter out common barcode scanner control characters
        const cleanCode = completeCode.replace(/[\x00-\x1F\x7F]/g, '');
        
        if (cleanCode.length > 0) {
          onScan(cleanCode, 'BLUETOOTH');
          
          toast({
            title: "Barkod oxundu",
            description: `Bluetooth: ${cleanCode}`,
          });
        }
      }
    }
  }, [onScan]);

  // Connect to Bluetooth device
  const connectToDevice = useCallback(async (deviceId?: string) => {
    if (!isSupported) {
      toast({
        title: "Bluetooth dəstəklənmir",
        description: "Bu brauzer Web Bluetooth API-ni dəstəkləmir",
        variant: "destructive"
      });
      return false;
    }

    setIsConnecting(true);

    try {
      let device: any; // BluetoothDevice

      if (deviceId) {
        // Reconnect to known device
        const knownDevice = availableDevices.find(d => d.id === deviceId);
        if (!knownDevice?.device) {
          throw new Error('Device not found');
        }
        device = knownDevice.device;
      } else {
        // Discover new device
        const requestOptions: any = { // RequestDeviceOptions
          acceptAllDevices: true,
          optionalServices: [
            'battery_service',
            'device_information',
            '6e400001-b5a3-f393-e0a9-e50e24dcca9e', // Nordic UART Service UUID
            ...filterServices || []
          ]
        };

        device = await (navigator as any).bluetooth.requestDevice(requestOptions);
      }

      if (!device) {
        throw new Error('No device selected');
      }

      // Connect to GATT server
      const server = await device.gatt?.connect();
      if (!server) {
        throw new Error('Failed to connect to GATT server');
      }

      // Try to find a service that might be used for data transmission
      const services = await server.getPrimaryServices();
      let characteristic: any = null; // BluetoothRemoteGATTCharacteristic

      // Common service UUIDs for barcode scanners
      const commonServiceUUIDs = [
        '6e400001-b5a3-f393-e0a9-e50e24dcca9e', // Nordic UART Service
        '0000ffe0-0000-1000-8000-00805f9b34fb', // Generic service
        '12345678-1234-1234-1234-123456789abc'  // Custom service
      ];

      for (const service of services) {
        try {
          const characteristics = await service.getCharacteristics();
          
          for (const char of characteristics) {
            // Look for characteristics that can notify (typical for data input)
            if (char.properties.notify || char.properties.read) {
              characteristic = char;
              break;
            }
          }
          
          if (characteristic) break;
        } catch (err) {
          console.log('Could not access service:', service.uuid);
        }
      }

      if (!characteristic) {
        // Try HID service as fallback for keyboard-like scanners
        try {
          const hidService = await server.getPrimaryService('human_interface_device');
          const chars = await hidService.getCharacteristics();
          characteristic = chars.find(c => c.properties.notify) || null;
        } catch (err) {
          console.log('HID service not available');
        }
      }

      if (characteristic) {
        // Subscribe to notifications
        if (characteristic.properties.notify) {
          await characteristic.startNotifications();
          characteristic.addEventListener('characteristicvaluechanged', handleCharacteristicValueChanged);
        }
        
        characteristicRef.current = characteristic;
      }

      // Update device state
      const deviceInfo: BluetoothDevice = {
        id: device.id,
        name: device.name || 'Unknown Device',
        connected: true,
        device: device
      };

      setConnectedDevice(deviceInfo);
      setIsScanning(true);

      // Add to available devices list
      setAvailableDevices(prev => {
        const exists = prev.find(d => d.id === deviceInfo.id);
        if (exists) {
          return prev.map(d => d.id === deviceInfo.id ? deviceInfo : d);
        }
        return [...prev, deviceInfo];
      });

      toast({
        title: "Bluetooth cihaz qoşuldu",
        description: `${deviceInfo.name} uğurla qoşuldu`,
      });

      return true;

    } catch (error) {
      console.error('Bluetooth connection error:', error);
      
      let errorMessage = 'Bluetooth cihaza qoşulma xətası';
      
      if (error instanceof Error) {
        if (error.message.includes('User cancelled')) {
          errorMessage = 'İstifadəçi tərəfindən ləğv edildi';
        } else if (error.message.includes('not found')) {
          errorMessage = 'Cihaz tapılmadı və ya əlçatan deyil';
        } else if (error.message.includes('GATT')) {
          errorMessage = 'Cihazla əlaqə qurula bilmədi';
        }
      }

      toast({
        title: "Bluetooth xətası",
        description: errorMessage,
        variant: "destructive"
      });

      return false;
    } finally {
      setIsConnecting(false);
    }
  }, [isSupported, availableDevices, filterServices, handleCharacteristicValueChanged]);

  // Disconnect from device
  const disconnectDevice = useCallback(() => {
    if (connectedDevice?.device?.gatt?.connected) {
      connectedDevice.device.gatt.disconnect();
    }

    if (characteristicRef.current) {
      characteristicRef.current.removeEventListener('characteristicvaluechanged', handleCharacteristicValueChanged);
      characteristicRef.current = null;
    }

    setConnectedDevice(null);
    setIsScanning(false);
    bufferRef.current = '';

    toast({
      title: "Bluetooth cihaz ayrıldı",
      description: "Cihaz uğurla ayrıldı",
    });
  }, [connectedDevice, handleCharacteristicValueChanged]);

  // Auto-connect to last known device
  useEffect(() => {
    if (autoConnect && isSupported && availableDevices.length > 0 && !connectedDevice) {
      const lastDevice = availableDevices[availableDevices.length - 1];
      if (lastDevice && !lastDevice.connected) {
        connectToDevice(lastDevice.id);
      }
    }
  }, [autoConnect, isSupported, availableDevices, connectedDevice, connectToDevice]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (connectedDevice?.device?.gatt?.connected) {
        connectedDevice.device.gatt.disconnect();
      }
    };
  }, [connectedDevice]);

  return {
    isSupported,
    isScanning,
    isConnecting,
    connectedDevice,
    availableDevices,
    connectToDevice,
    disconnectDevice,
  };
}