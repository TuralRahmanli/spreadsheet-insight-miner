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
      const exportData = {
        products,
        warehouses,
        packagingOptions,
        version: "1.0.0",
        exportDate: new Date().toISOString(),
        deviceName: navigator.userAgent.includes('Mobile') ? 'Mobil Cihaz' : 'Kompyuter'
      };

      const jsonString = JSON.stringify(exportData, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = url;
      link.download = `anbar_məlumatları_${new Date().toISOString().split('T')[0]}.json`;
      link.click();

      URL.revokeObjectURL(url);

      toast({
        title: "Məlumatlar export edildi",
        description: "Fayl yükləndi və paylaşmaq üçün hazırdır",
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
      const exportData = {
        products,
        warehouses,
        packagingOptions,
        version: "1.0.0",
        exportDate: new Date().toISOString(),
        deviceName: navigator.userAgent.includes('Mobile') ? 'Mobil Cihaz' : 'Kompyuter'
      };

      const jsonString = JSON.stringify(exportData, null, 2);
      const fileName = `anbar_məlumatları_${new Date().toISOString().split('T')[0]}.json`;

      // Check if we're on a native platform (Android/iOS)
      if (Capacitor.isNativePlatform()) {
        // Write the file to a temporary location first
        const blob = new Blob([jsonString], { type: 'application/json' });
        const url = URL.createObjectURL(blob);

        // Use Capacitor Share plugin for native sharing
        await Share.share({
          title: 'Anbar Sistemi Məlumatları',
          text: 'Anbar sistemindən export edilmiş məlumatlar',
          url: url,
          dialogTitle: 'Məlumatları paylaş'
        });

        URL.revokeObjectURL(url);

        toast({
          title: "Native paylaşma açıldı",
          description: "Quick Share, Bluetooth və ya digər seçimlərdən birini seçin",
        });
      } else {
        // Web platform - use Web Share API or download fallback
        const blob = new Blob([jsonString], { type: 'application/json' });
        const file = new File([blob], fileName, { type: 'application/json' });

        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          await navigator.share({
            title: 'Anbar Sistemi Məlumatları',
            text: 'Anbar sistemindən export edilmiş məlumatlar',
            files: [file],
          });

          toast({
            title: "Paylaşıldı",
            description: "Məlumatlar uğurla paylaşıldı",
          });
        } else {
          // Fallback - just download the file
          exportToFile();
          toast({
            title: "Paylaşma dəstəklənmir",
            description: "Fayl yükləndi, manual olaraq paylaşa bilərsiniz",
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