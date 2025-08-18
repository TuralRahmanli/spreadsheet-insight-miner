import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface WarehouseStockEntry {
  productId: string;
  warehouseName: string;
  quantity: number;
}

interface WarehouseStockStore {
  warehouseStock: WarehouseStockEntry[];
  updateStock: (productId: string, warehouseName: string, quantity: number) => void;
  getProductStock: (productId: string, warehouseName: string) => number;
  getWarehouseStock: (warehouseName: string) => WarehouseStockEntry[];
  getAllStock: () => WarehouseStockEntry[];
  clearWarehouseStock: () => void;
}

export const useWarehouseStockStore = create<WarehouseStockStore>()(
  persist(
    (set, get) => ({
      warehouseStock: [],
      updateStock: (productId, warehouseName, quantity) =>
        set((state) => {
          const existingIndex = state.warehouseStock.findIndex(
            entry => entry.productId === productId && entry.warehouseName === warehouseName
          );
          
          if (existingIndex >= 0) {
            // Update existing entry
            const updatedStock = [...state.warehouseStock];
            updatedStock[existingIndex] = {
              ...updatedStock[existingIndex],
              quantity: Math.max(0, quantity)
            };
            return { warehouseStock: updatedStock };
          } else {
            // Add new entry
            return {
              warehouseStock: [
                ...state.warehouseStock,
                { productId, warehouseName, quantity: Math.max(0, quantity) }
              ]
            };
          }
        }),
      getProductStock: (productId, warehouseName) => {
        const entry = get().warehouseStock.find(
          entry => entry.productId === productId && entry.warehouseName === warehouseName
        );
        return entry?.quantity || 0;
      },
      getWarehouseStock: (warehouseName) => {
        return get().warehouseStock.filter(entry => entry.warehouseName === warehouseName);
      },
      getAllStock: () => get().warehouseStock,
      clearWarehouseStock: () => set({ warehouseStock: [] }),
    }),
    {
      name: 'warehouse-stock-storage',
    }
  )
);