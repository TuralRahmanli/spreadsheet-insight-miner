export type Product = {
  id: string;
  article: string;
  name: string;
  category: string;
  status: 'active' | 'low_stock' | 'out_of_stock';
  stock: number;
  unit: string;
  packaging: string[];
  warehouses: string[];
  description?: string;
  createdAt?: Date;
  updatedAt?: Date;
};

export type Warehouse = {
  id: string;
  name: string;
  description?: string;
  location?: string;
  capacity?: number;
  createdAt?: Date;
  updatedAt?: Date;
};

export type Operation = {
  id: string;
  type: 'daxil' | 'xaric' | 'satış' | 'transfer' | 'əvvəldən_qalıq';
  productId: string;
  warehouseId: string;
  warehouseName?: string;
  quantity: number;
  date: Date;
  description?: string;
  createdBy?: string;
};

export type PackagingEntry = {
  type: string;
  count: number;
};

export type StorageProvider = 'local' | 'google-drive';

export type Theme = 'light' | 'dark' | 'system';

export type ValidationError = {
  field: string;
  message: string;
};

export type ApiResponse<T> = {
  data: T;
  success: boolean;
  error?: string;
};

export type PaginationParams = {
  page: number;
  limit: number;
  total: number;
};

export type FilterParams = {
  search?: string;
  category?: string;
  status?: string;
  warehouse?: string;
  unit?: string;
};