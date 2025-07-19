// Global product store for shared product data across pages
import { create } from 'zustand';

interface Product {
  id: string;
  article: string;
  name: string;
  category: string;
  status: string;
  stock: number;
  description?: string;
}

interface ProductStore {
  products: Product[];
  addProduct: (product: Product) => void;
  removeProduct: (productId: string) => void;
  updateProduct: (productId: string, updates: Partial<Product>) => void;
  getProducts: () => Product[];
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
    description: "Premium keyfiyyətli albalı məhsulu"
  },
  {
    id: "ALB-002", 
    article: "ALB-002",
    name: "Albalı Məhsulu Tip 2",
    category: "Albalı",
    status: "active",
    stock: 200,
    description: "Standart keyfiyyətli albalı məhsulu"
  },
  {
    id: "ALB-003",
    article: "ALB-003", 
    name: "Albalı Məhsulu Tip 3",
    category: "Albalı",
    status: "active",
    stock: 80,
    description: "Deluxe keyfiyyətli albalı məhsulu"
  },
  {
    id: "QAR-001",
    article: "QAR-001",
    name: "Qarağat Məhsulu Tip 1", 
    category: "Qarağat",
    status: "active",
    stock: 120,
    description: "Premium keyfiyyətli qarağat məhsulu"
  },
  {
    id: "QAR-002",
    article: "QAR-002",
    name: "Qarağat Məhsulu Tip 2",
    category: "Qarağat", 
    status: "low_stock",
    stock: 45,
    description: "Standart keyfiyyətli qarağat məhsulu"
  },
  {
    id: "MNG-001",
    article: "MNG-001",
    name: "Mango Məhsulu Tip 1",
    category: "Mango",
    status: "active",
    stock: 90,
    description: "Premium keyfiyyətli mango məhsulu"
  },
  {
    id: "MNG-002",
    article: "MNG-002", 
    name: "Mango Məhsulu Tip 2",
    category: "Mango",
    status: "active",
    stock: 110,
    description: "Standart keyfiyyətli mango məhsulu"
  },
  {
    id: "MNG-003",
    article: "MNG-003",
    name: "Mango Məhsulu Tip 3",
    category: "Mango",
    status: "out_of_stock",
    stock: 0,
    description: "Lux keyfiyyətli mango məhsulu"
  },
  {
    id: "ZEY-001",
    article: "ZEY-001",
    name: "Zeytun Məhsulu Tip 1",
    category: "Zeytun",
    status: "active", 
    stock: 75,
    description: "Premium keyfiyyətli zeytun məhsulu"
  },
  {
    id: "ZEY-002",
    article: "ZEY-002",
    name: "Zeytun Məhsulu Tip 2",
    category: "Zeytun",
    status: "active",
    stock: 95,
    description: "Standart keyfiyyətli zeytun məhsulu"
  }
];

export const useProductStore = create<ProductStore>((set, get) => ({
  products: initialProducts,
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
  getProducts: () => get().products,
}));