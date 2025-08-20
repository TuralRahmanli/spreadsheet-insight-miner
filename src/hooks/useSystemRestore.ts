import { useCallback } from 'react';
import { useProductStore } from '@/lib/productStore';
import { useWarehouseStore } from '@/lib/warehouseStore';
import { usePackagingStore } from '@/lib/packagingStore';
import { toast } from '@/hooks/use-toast';

interface SystemBackupData {
  products: any[];
  warehouses: any[];
  packagingOptions: string[];
  settings?: any;
  storageConfig?: any;
  theme?: string;
  version: string;
  exportDate: string;
  deviceName: string;
  systemBackup?: boolean;
}

export const useSystemRestore = () => {
  const { clearAllProducts, addProduct } = useProductStore();
  const { clearAllWarehouses, addWarehouse } = useWarehouseStore();
  const { packagingOptions, addPackagingOption, removePackagingOption } = usePackagingStore();

  const restoreSystem = useCallback(async (file: File) => {
    try {
      const text = await file.text();
      const backupData: SystemBackupData = JSON.parse(text);

      // Validate that this is a system backup
      if (!backupData.systemBackup && !backupData.version) {
        throw new Error('Bu fayl sistem yedeyi deyil');
      }

      // Show confirmation dialog
      const confirmed = window.confirm(
        `Sistem yedeyini bərpa etmək istədiyinizə əminsiniz?\n\n` +
        `Yedek məlumatları:\n` +
        `• Məhsullar: ${backupData.products?.length || 0}\n` +
        `• Anbarlar: ${backupData.warehouses?.length || 0}\n` +
        `• Paketləşdirmə: ${backupData.packagingOptions?.length || 0}\n` +
        `• Tarix: ${new Date(backupData.exportDate).toLocaleDateString('az-AZ')}\n` +
        `• Cihaz: ${backupData.deviceName}\n\n` +
        `Bu əməliyyat mövcud məlumatları əvəzləyəcək!`
      );

      if (!confirmed) {
        return false;
      }

      // Restore store data
      if (backupData.products) {
        clearAllProducts();
        backupData.products.forEach(product => {
          addProduct(product);
        });
      }
      
      if (backupData.warehouses) {
        clearAllWarehouses();
        backupData.warehouses.forEach(warehouse => {
          addWarehouse(warehouse);
        });
      }
      
      if (backupData.packagingOptions) {
        // Clear existing packaging options
        packagingOptions.forEach(option => {
          removePackagingOption(option);
        });
        // Add new packaging options
        backupData.packagingOptions.forEach(option => {
          addPackagingOption(option);
        });
      }

      // Restore settings
      if (backupData.settings) {
        localStorage.setItem('app-settings', JSON.stringify(backupData.settings));
      }

      if (backupData.storageConfig) {
        localStorage.setItem('storage-config', JSON.stringify(backupData.storageConfig));
      }

      if (backupData.theme) {
        localStorage.setItem('vite-ui-theme', backupData.theme);
      }

      toast({
        title: "Sistem bərpa edildi",
        description: `${backupData.products?.length || 0} məhsul, ${backupData.warehouses?.length || 0} anbar və bütün parametrlər bərpa edildi`,
      });

      // Suggest page reload for full effect
      setTimeout(() => {
        const reload = window.confirm(
          'Sistem tamamilə bərpa edildi. Səhifəni yeniləmək istəyirsiniz?'
        );
        if (reload) {
          window.location.reload();
        }
      }, 2000);

      return true;
    } catch (error) {
      toast({
        title: "Bərpa xətası",
        description: error instanceof Error ? error.message : "Sistem bərpa edilərkən xəta baş verdi",
        variant: "destructive",
      });
      return false;
    }
  }, [clearAllProducts, addProduct, clearAllWarehouses, addWarehouse, packagingOptions, addPackagingOption, removePackagingOption]);

  const triggerSystemRestore = useCallback(() => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        await restoreSystem(file);
      }
    };
    input.click();
  }, [restoreSystem]);

  return {
    restoreSystem,
    triggerSystemRestore
  };
};