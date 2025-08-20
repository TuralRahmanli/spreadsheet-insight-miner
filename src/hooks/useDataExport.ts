import { useCallback } from 'react';
import { Share } from '@capacitor/share';
import { Capacitor } from '@capacitor/core';
import { useProductStore } from '@/lib/productStore';
import { useWarehouseStore } from '@/lib/warehouseStore';
import { usePackagingStore } from '@/lib/packagingStore';
import { toast } from '@/hooks/use-toast';

export const useDataExport = () => {
  const { products } = useProductStore();
  const { warehouses } = useWarehouseStore();
  const { packagingOptions } = usePackagingStore();

  const exportToFile = useCallback(() => {
    try {
      // Get all settings and data from localStorage
      const appSettings = localStorage.getItem('app-settings');
      const storageConfig = localStorage.getItem('storage-config');
      const theme = localStorage.getItem('vite-ui-theme');
      
      const exportData = {
        // Store data
        products,
        warehouses,
        packagingOptions,
        // System settings
        settings: appSettings ? JSON.parse(appSettings) : null,
        storageConfig: storageConfig ? JSON.parse(storageConfig) : null,
        theme: theme || 'system',
        // Metadata
        version: "2.0.0",
        exportDate: new Date().toISOString(),
        deviceName: navigator.userAgent.includes('Mobile') ? 'Mobil Cihaz' : 'Kompyuter',
        systemBackup: true
      };

      const jsonString = JSON.stringify(exportData, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = url;
      link.download = `sistem_yedeyi_${new Date().toISOString().split('T')[0]}.json`;
      link.click();

      URL.revokeObjectURL(url);

      toast({
        title: "Sistem yedeyi hazırlandı",
        description: "Tam sistem yedeyi yükləndi və başqa cihaza quraşdırmaq üçün hazırdır",
      });

      return blob;
    } catch (error) {
      toast({
        title: "Export xətası",
        description: "Məlumatlar export edilərkən xəta baş verdi",
        variant: "destructive",
      });
    }
  }, [products, warehouses, packagingOptions]);

  const shareData = useCallback(async () => {
    try {
      // Get all settings and data from localStorage
      const appSettings = localStorage.getItem('app-settings');
      const storageConfig = localStorage.getItem('storage-config');
      const theme = localStorage.getItem('vite-ui-theme');
      
      const exportData = {
        // Store data
        products,
        warehouses,
        packagingOptions,
        // System settings
        settings: appSettings ? JSON.parse(appSettings) : null,
        storageConfig: storageConfig ? JSON.parse(storageConfig) : null,
        theme: theme || 'system',
        // Metadata
        version: "2.0.0",
        exportDate: new Date().toISOString(),
        deviceName: navigator.userAgent.includes('Mobile') ? 'Mobil Cihaz' : 'Kompyuter',
        systemBackup: true
      };

      const jsonString = JSON.stringify(exportData, null, 2);
      const fileName = `sistem_yedeyi_${new Date().toISOString().split('T')[0]}.json`;

      // Check if we're on a native platform (Android/iOS)
      if (Capacitor.isNativePlatform()) {
        // Write the file to a temporary location first
        const blob = new Blob([jsonString], { type: 'application/json' });
        const url = URL.createObjectURL(blob);

        // Use Capacitor Share plugin for native sharing
        await Share.share({
          title: 'Anbar Sistemi Tam Yedeyi',
          text: 'Sistem yedeyi - başqa cihaza quraşdırmaq üçün hazırdır',
          url: url,
          dialogTitle: 'Sistem yedeyini paylaş'
        });

        URL.revokeObjectURL(url);

        toast({
          title: "Sistem yedeyi paylaşıma hazırdır",
          description: "Quick Share, Bluetooth və ya digər üsullarla başqa cihaza göndərin",
        });
      } else {
        // Web platform - use Web Share API or download fallback
        const blob = new Blob([jsonString], { type: 'application/json' });
        const file = new File([blob], fileName, { type: 'application/json' });

        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          await navigator.share({
            title: 'Anbar Sistemi Tam Yedeyi',
            text: 'Sistem yedeyi - başqa cihaza quraşdırmaq üçün hazırdır',
            files: [file],
          });

          toast({
            title: "Sistem yedeyi paylaşıldı",
            description: "Tam sistem yedeyi uğurla paylaşıldı",
          });
        } else {
          // Fallback - just download the file
          exportToFile();
          toast({
            title: "Paylaşma dəstəklənmir",
            description: "Sistem yedeyi yükləndi, manual olaraq paylaşa bilərsiniz",
          });
        }
      }
    } catch (error) {
      toast({
        title: "Paylaşma xətası",
        description: "Məlumatlar paylaşılarkən xəta baş verdi",
        variant: "destructive",
      });
    }
  }, [products, warehouses, packagingOptions, exportToFile]);

  return {
    exportToFile,
    shareData
  };
};