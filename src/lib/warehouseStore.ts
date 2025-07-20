import { create } from 'zustand';

interface WarehouseStore {
  warehouses: Array<{ id: string; name: string }>;
  addWarehouse: (warehouse: { id: string; name: string }) => void;
  removeWarehouse: (warehouseId: string) => void;
  updateWarehouse: (warehouseId: string, updates: Partial<{ id: string; name: string }>) => void;
  clearAllWarehouses: () => void;
  getWarehouses: () => Array<{ id: string; name: string }>;
}

export const useWarehouseStore = create<WarehouseStore>((set, get) => ({
  warehouses: [],
  addWarehouse: (warehouse) => 
    set((state) => ({ warehouses: [...state.warehouses, warehouse] })),
  removeWarehouse: (warehouseId) => 
    set((state) => ({ warehouses: state.warehouses.filter(w => w.id !== warehouseId) })),
  updateWarehouse: (warehouseId, updates) =>
    set((state) => ({ 
      warehouses: state.warehouses.map(w => 
        w.id === warehouseId ? { ...w, ...updates } : w
      ) 
    })),
  clearAllWarehouses: () => set({ warehouses: [] }),
  getWarehouses: () => get().warehouses,
}));