import { z } from "zod";

// Ümumi validation schemas
export const productSchema = z.object({
  id: z.string().min(1, "ID tələb olunur"),
  article: z.string().min(1, "Artikul tələb olunur").max(50, "Artikul çox uzundur"),
  name: z.string().min(2, "Ad ən azı 2 simvol olmalıdır").max(100, "Ad çox uzundur"),
  category: z.string().min(1, "Kateqoriya seçilməlidir"),
  status: z.enum(["active", "inactive", "low_stock", "out_of_stock"]),
  stock: z.number().min(0, "Stok mənfi ola bilməz").max(999999, "Stok həddən artıqdır"),
  unit: z.string().min(1, "Vahid tələb olunur"),
  packaging: z.array(z.string()).min(1, "Ən azı bir paketləşdirmə növü olmalıdır"),
  warehouses: z.array(z.string()),
  description: z.string().optional()
});

export const warehouseSchema = z.object({
  id: z.string().min(1, "ID tələb olunur"),
  name: z.string()
    .min(2, "Anbar adı ən azı 2 simvol olmalıdır")
    .max(50, "Anbar adı çox uzundur")
    .regex(/^[a-zA-ZəçğıöşüĞÜÇÖŞİıƏ0-9\s\-_.]+$/, "Anbar adında qeyri-qanuni simvollar var")
});

export const operationSchema = z.object({
  operationType: z.enum(["incoming", "outgoing", "sale", "return", "transfer", "adjustment"]),
  selectedWarehouse: z.string().min(1, "Anbar seçilməlidir"),
  selectedDestinationWarehouse: z.string().optional(),
  batchName: z.string().optional(),
  selectedProducts: z.array(z.object({
    productId: z.string().min(1, "Məhsul seçilməlidir"),
    packaging: z.array(z.object({
      type: z.string().min(1, "Paketləşdirmə növü tələb olunur"),
      count: z.number().min(1, "Say ən azı 1 olmalıdır").max(10000, "Say həddən artıqdır")
    })).min(1, "Ən azı bir paketləşdirmə əlavə edilməlidir")
  })).min(1, "Ən azı bir məhsul əlavə edilməlidir"),
  notes: z.string().max(500, "Qeydlər çox uzundur").optional()
});

// Utility functions
export const sanitizeString = (input: string): string => {
  return input.trim().replace(/[<>]/g, "");
};

export const sanitizeNumber = (input: string | number): number => {
  const num = typeof input === "string" ? parseFloat(input) : input;
  return isNaN(num) ? 0 : Math.max(0, num);
};

export const validatePackagingInput = (input: string): boolean => {
  // Paketləşdirmə formatını yoxla: rəqəm və ya rəqəm+(rəqəm) formatı
  return /^\d+(\+\(\d+\))?$/.test(input.trim());
};

// Email validation
export const emailSchema = z.string().email("Düzgün email ünvanı daxil edin");

// Phone validation (Azərbaycan formatı)
export const phoneSchema = z.string()
  .regex(/^\+994\d{9}$|^0\d{9}$/, "Düzgün telefon nömrəsi daxil edin");

// Password validation
export const passwordSchema = z.string()
  .min(8, "Parol ən azı 8 simvol olmalıdır")
  .regex(/[A-Z]/, "Parolda ən azı bir böyük hərf olmalıdır")
  .regex(/[a-z]/, "Parolda ən azı bir kiçik hərf olmalıdır")
  .regex(/\d/, "Parolda ən azı bir rəqəm olmalıdır");

export type Product = z.infer<typeof productSchema>;
export type Warehouse = z.infer<typeof warehouseSchema>;
export type Operation = z.infer<typeof operationSchema>;