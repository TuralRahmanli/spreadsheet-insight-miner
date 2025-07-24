import { useCallback } from 'react';
import { useProductStore } from '@/lib/productStore';
import { useWarehouseStore } from '@/lib/warehouseStore';
import { usePackagingStore } from '@/lib/packagingStore';
import { toast } from '@/hooks/use-toast';
import { Product, Warehouse } from '@/types';

interface ImportData {
  products?: Product[];
  warehouses?: Warehouse[];
  packagingOptions?: string[];
  version?: string;
  exportDate?: string;
  deviceName?: string;
}

export const useAutoImport = () => {
  const { addProduct, products } = useProductStore();
  const { addWarehouse, warehouses } = useWarehouseStore();
  const { addPackagingOption, packagingOptions } = usePackagingStore();

  const processImportFile = useCallback(async (file: File) => {
    try {
      const text = await file.text();
      const data: ImportData = JSON.parse(text);

      // Validate data format
      if (!data.products && !data.warehouses && !data.packagingOptions) {
        toast({
          title: "Səhv fayl formatı",
          description: "Bu fayl anbar sistemi məlumatları deyil",
          variant: "destructive",
        });
        return;
      }

      let newItemsCount = 0;
      let duplicatesCount = 0;

      // Process products
      if (data.products) {
        data.products.forEach(product => {
          const exists = products.find(p => p.id === product.id || p.name === product.name);
          if (!exists) {
            addProduct(product);
            newItemsCount++;
          } else {
            duplicatesCount++;
          }
        });
      }

      // Process warehouses
      if (data.warehouses) {
        data.warehouses.forEach(warehouse => {
          const exists = warehouses.find(w => w.id === warehouse.id || w.name === warehouse.name);
          if (!exists) {
            addWarehouse(warehouse);
            newItemsCount++;
          } else {
            duplicatesCount++;
          }
        });
      }

      // Process packaging options
      if (data.packagingOptions) {
        data.packagingOptions.forEach(option => {
          const exists = packagingOptions.includes(option);
          if (!exists) {
            addPackagingOption(option);
            newItemsCount++;
          } else {
            duplicatesCount++;
          }
        });
      }

      // Show import results
      if (newItemsCount > 0) {
        toast({
          title: "İmport uğurla tamamlandı",
          description: `${newItemsCount} yeni element əlavə edildi${duplicatesCount > 0 ? `, ${duplicatesCount} duplikat atlandı` : ''}`,
        });
      } else if (duplicatesCount > 0) {
        toast({
          title: "Heç bir yeni element tapılmadı",
          description: `${duplicatesCount} element artıq mövcuddur`,
        });
      }

      return { newItemsCount, duplicatesCount };

    } catch (error) {
      console.error('Import error:', error);
      toast({
        title: "İmport xətası",
        description: "Fayl oxunarkən xəta baş verdi",
        variant: "destructive",
      });
    }
  }, [addProduct, products, addWarehouse, warehouses, addPackagingOption, packagingOptions]);

  const handleFileInput = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === 'application/json') {
      processImportFile(file);
    } else {
      toast({
        title: "Səhv fayl növü",
        description: "Yalnız JSON faylları dəstəklənir",
        variant: "destructive",
      });
    }
  }, [processImportFile]);

  const triggerFileSelect = useCallback(() => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json,application/json';
    input.onchange = (e) => {
      const target = e.target as HTMLInputElement;
      if (target.files?.[0]) {
        processImportFile(target.files[0]);
      }
    };
    input.click();
  }, [handleFileInput]);

  return {
    processImportFile,
    triggerFileSelect,
    handleFileInput
  };
};