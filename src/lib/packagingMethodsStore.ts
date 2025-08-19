import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface PackagingMethodsStore {
  packagingMethods: string[];
  addPackagingMethod: (method: string) => void;
  removePackagingMethod: (method: string) => void;
}

// Initial packaging methods as requested by user
const initialPackagingMethods = [
  "Rulon", "Qutu", "Yeşik", "Balon", "Banka", "Torbalar", 
  "Kasa", "Konteyner", "Paket", "Çuval", "Silindr", "Barel"
];

export const usePackagingMethodsStore = create<PackagingMethodsStore>()(
  persist(
    (set, get) => ({
      packagingMethods: initialPackagingMethods,
      addPackagingMethod: (method) => 
        set((state) => ({ 
          packagingMethods: state.packagingMethods.includes(method) 
            ? state.packagingMethods 
            : [...state.packagingMethods, method].sort()
        })),
      removePackagingMethod: (method) =>
        set((state) => ({ 
          packagingMethods: state.packagingMethods.filter(m => m !== method) 
        })),
    }),
    {
      name: 'packaging-methods-storage',
    }
  )
);