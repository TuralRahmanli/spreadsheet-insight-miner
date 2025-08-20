// Global product store for shared product data across pages
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Product } from '@/types';
import { useWarehouseStockStore } from './warehouseStockStore';

interface ProductStore {
  products: Product[];
  addProduct: (product: Product) => void;
  removeProduct: (productId: string) => void;
  updateProduct: (productId: string, updates: Partial<Product>) => void;
  updateWarehouseStock: (productId: string, warehouseName: string, quantity: number, operation: 'increase' | 'decrease') => void;
  updateProductPackaging: (productId: string, packaging: {type: string, quantity: number}[]) => void;
  getProducts: () => Product[];
  clearAllProducts: () => void;
  isLoading: boolean;
  error: string | null;
}

// Initial product data
const initialProducts: Product[] = [
  {
    id: "ALB-001",
    article: "ALB-001",
    name: "Albalı Məhsulu Tip 1",
    category: "Albalı",
    status: "active",
    stock: 150,
    unit: "kg",
    packaging: [{type: "Paket", quantity: 41}, {type: "Rulon", quantity: 2}],
    warehouses: ["Anbar 1", "Anbar 2"],
    description: "Premium keyfiyyətli albalı məhsulu"
  },
  {
    id: "ALB-002", 
    article: "ALB-002",
    name: "Albalı Məhsulu Tip 2",
    category: "Albalı",
    status: "active",
    stock: 200,
    unit: "kg",
    packaging: [{type: "Paket", quantity: 25}, {type: "Qutu", quantity: 3}],
    warehouses: ["Anbar 1"],
    description: "Standart keyfiyyətli albalı məhsulu"
  },
  {
    id: "ALB-003",
    article: "ALB-003", 
    name: "Albalı Məhsulu Tip 3",
    category: "Albalı",
    status: "active",
    stock: 80,
    unit: "kg",
    packaging: [{type: "135", quantity: 2}, {type: "120", quantity: 4}],
    warehouses: ["Anbar 2", "Anbar 3"],
    description: "Deluxe keyfiyyətli albalı məhsulu"
  },
  {
    id: "QAR-001",
    article: "QAR-001",
    name: "Qarağat Məhsulu Tip 1", 
    category: "Qarağat",
    status: "active",
    stock: 120,
    unit: "kg",
    packaging: [{type: "100", quantity: 3}, {type: "110", quantity: 5}],
    warehouses: ["Anbar 1", "Anbar 3"],
    description: "Premium keyfiyyətli qarağat məhsulu"
  },
  {
    id: "QAR-002",
    article: "QAR-002",
    name: "Qarağat Məhsulu Tip 2",
    category: "Qarağat", 
    status: "low_stock",
    stock: 45,
    unit: "kg",
    packaging: [{type: "100", quantity: 2}, {type: "120", quantity: 3}],
    warehouses: ["Anbar 2"],
    description: "Standart keyfiyyətli qarağat məhsulu"
  },
  {
    id: "MNG-001",
    article: "MNG-001",
    name: "Mango Məhsulu Tip 1",
    category: "Mango",
    status: "active",
    stock: 90,
    unit: "ədəd",
    packaging: [{type: "100", quantity: 4}, {type: "120", quantity: 6}, {type: "135", quantity: 3}],
    warehouses: ["Anbar 1", "Anbar 2", "Anbar 3"],
    description: "Premium keyfiyyətli mango məhsulu"
  },
  {
    id: "MNG-002",
    article: "MNG-002", 
    name: "Mango Məhsulu Tip 2",
    category: "Mango",
    status: "active",
    stock: 110,
    unit: "ədəd",
    packaging: [{type: "110", quantity: 5}, {type: "120", quantity: 2}],
    warehouses: ["Anbar 2"],
    description: "Standart keyfiyyətli mango məhsulu"
  },
  {
    id: "MNG-003",
    article: "MNG-003",
    name: "Mango Məhsulu Tip 3",
    category: "Mango",
    status: "out_of_stock",
    stock: 0,
    unit: "ədəd",
    packaging: [{type: "100", quantity: 0}, {type: "135", quantity: 0}],
    warehouses: [],
    description: "Lux keyfiyyətli mango məhsulu"
  },
  {
    id: "ZEY-001",
    article: "ZEY-001",
    name: "Zeytun Məhsulu Tip 1",
    category: "Zeytun",
    status: "active", 
    stock: 75,
    unit: "litr",
    packaging: [{type: "100", quantity: 3}, {type: "110", quantity: 4}, {type: "120", quantity: 2}],
    warehouses: ["Anbar 1"],
    description: "Premium keyfiyyətli zeytun məhsulu"
  },
  {
    id: "ZEY-002",
    article: "ZEY-002",
    name: "Zeytun Məhsulu Tip 2",
    category: "Zeytun",
    status: "active",
    stock: 95,
    unit: "litr",
    packaging: [{type: "120", quantity: 3}, {type: "135", quantity: 4}],
    warehouses: ["Anbar 3"],
    description: "Standart keyfiyyətli zeytun məhsulu"
  }
];

export const useProductStore = create<ProductStore>()(
  persist(
    (set, get) => ({
      products: initialProducts, // İlkin məlumatlarla başla
      isLoading: false,
      error: null,
      addProduct: (product) => 
        set((state) => ({ products: [...state.products, product] })),
      removeProduct: (productId) => 
        set((state) => ({ products: state.products.filter(p => p.id !== productId) })),
      updateProduct: (productId, updates) =>
        set((state) => ({ 
          products: state.products.map(p => 
            p.id === productId ? { ...p, ...updates } : p
          ) 
        })),
      updateWarehouseStock: (productId, warehouseName, quantity, operation) =>
        set((state) => {
          // Update warehouse stock store
          const warehouseStockStore = useWarehouseStockStore.getState();
          const currentStock = warehouseStockStore.getProductStock(productId, warehouseName);
          const newWarehouseStock = operation === 'increase' 
            ? currentStock + quantity 
            : Math.max(0, currentStock - quantity);
          warehouseStockStore.updateStock(productId, warehouseName, newWarehouseStock);

          return {
            products: state.products.map(p => {
              if (p.id === productId) {
                // Add warehouse to product if not already present
                const updatedWarehouses = p.warehouses?.includes(warehouseName) 
                  ? p.warehouses 
                  : [...(p.warehouses || []), warehouseName];
                
                // Update total stock based on operation
                const newStock = operation === 'increase' 
                  ? p.stock + quantity 
                  : Math.max(0, p.stock - quantity);
                
                return {
                  ...p,
                  warehouses: updatedWarehouses,
                  stock: newStock
                };
              }
              return p;
            })
          };
        }),
      updateProductPackaging: (productId, packaging) =>
        set((state) => ({
          products: state.products.map(p => {
            if (p.id === productId) {
              return { ...p, packaging };
            }
            return p;
          })
        })),
      getProducts: () => get().products,
      clearAllProducts: () => set({ products: [] }),
    }),
    {
      name: 'product-storage',
      // Only persist products, not loading/error states
      partialize: (state) => ({ products: state.products }),
    }
  )
);