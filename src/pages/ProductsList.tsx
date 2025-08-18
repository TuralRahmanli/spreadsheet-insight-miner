import { useState, useMemo, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, Plus, Edit, Trash2, Package, Settings, GripVertical, Filter, X, Upload } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useToast } from "@/hooks/use-toast";
import { useProductStore } from "@/lib/productStore";
import { useWarehouseStockStore } from "@/lib/warehouseStockStore";
import { sanitizeString, sanitizeNumber } from "@/lib/validation";
import { Checkbox } from "@/components/ui/checkbox";
import { Product } from "@/types";
import * as XLSX from 'xlsx';

const getStatusBadge = (status: string, stock: number) => {
  if (status === "out_of_stock" || stock === 0) {
    return <Badge variant="destructive">Bitib</Badge>;
  }
  if (status === "low_stock" || stock < 50) {
    return <Badge variant="secondary" className="bg-warning text-warning-foreground">Az qalıb</Badge>;
  }
  return <Badge variant="secondary" className="bg-success text-success-foreground">Mövcud</Badge>;
};

export default function ProductsList() {
  const navigate = useNavigate();
  const { products, addProduct, removeProduct, updateProduct } = useProductStore();
  const { getProductStock } = useWarehouseStockStore();
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    status: "all",
    stockLevel: "all",
    unit: "all",
    category: "all"
  });
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<{
    article: string;
    name: string;
    category: string;
    stock: string;
    description: string;
  } | null>(null);
  const [newProduct, setNewProduct] = useState({
    article: "",
    name: "",
    category: "",
    stock: "",
    unit: "",
    packaging: [] as string[],
    description: ""
  });
  const { toast } = useToast();
  
  const categories = ["all", ...Array.from(new Set(products.map(p => p.category)))];
  const allWarehouses = Array.from(new Set(products.flatMap(p => p.warehouses || [])));
  
  // Generate warehouse columns dynamically
  const warehouseColumns = useMemo(() => {
    return allWarehouses.reduce((acc, warehouse) => {
      acc[`warehouse_${warehouse}`] = true;
      return acc;
    }, {} as Record<string, boolean>);
  }, [allWarehouses]);

  const [columnVisibility, setColumnVisibility] = useState({
    artikul: true,
    name: true,
    category: true,
    location: true,
    ...warehouseColumns,
    total: true,
    status: true,
    packaging: true,
    description: true
  });

  const [columnOrder, setColumnOrder] = useState([
    'artikul',
    'name', 
    'category',
    'location',
    ...allWarehouses.map(warehouse => `warehouse_${warehouse}`),
    'total',
    'status',
    'packaging',
    'description'
  ]);

  const [draggedColumn, setDraggedColumn] = useState<string | null>(null);
  
  // Update column visibility and order when warehouses change
  useEffect(() => {
    const newWarehouseColumns = allWarehouses.reduce((acc, warehouse) => {
      acc[`warehouse_${warehouse}`] = true;
      return acc;
    }, {} as Record<string, boolean>);

    setColumnVisibility(prev => ({
      artikul: true,
      name: true,
      category: true,
      location: true,
      ...newWarehouseColumns,
      total: true,
      status: true,
      packaging: true,
      description: true
    }));

    setColumnOrder([
      'artikul',
      'name', 
      'category',
      'location',
      ...allWarehouses.map(warehouse => `warehouse_${warehouse}`),
      'total',
      'status',
      'packaging',
      'description'
    ]);
  }, [allWarehouses]);
  
  // Get unique values for filter options
  const allStatuses = ["all", "active", "out_of_stock", "low_stock"];
  const allUnits = ["all", ...Array.from(new Set(products.map(p => p.unit).filter(Boolean)))];
  const stockLevels = ["all", "in_stock", "low_stock", "out_of_stock"];

  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           product.article.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = filters.category === "all" || product.category === filters.category;
      
      // Apply filters
      const matchesStatus = filters.status === "all" || 
        (filters.status === "active" && product.status === "active") ||
        (filters.status === "out_of_stock" && (product.status === "out_of_stock" || product.stock === 0)) ||
        (filters.status === "low_stock" && (product.status === "low_stock" || (product.stock > 0 && product.stock < 50)));
      
      const matchesStockLevel = filters.stockLevel === "all" ||
        (filters.stockLevel === "in_stock" && product.stock >= 50) ||
        (filters.stockLevel === "low_stock" && product.stock > 0 && product.stock < 50) ||
        (filters.stockLevel === "out_of_stock" && product.stock === 0);
      
      const matchesUnit = filters.unit === "all" || product.unit === filters.unit;
      
      return matchesSearch && matchesCategory && matchesStatus && matchesStockLevel && matchesUnit;
    });
  }, [products, searchTerm, filters]);

  const clearAllFilters = () => {
    setFilters({
      status: "all",
      stockLevel: "all",
      unit: "all",
      category: "all"
    });
    setSearchTerm("");
  };

  const hasActiveFilters = filters.status !== "all" || filters.stockLevel !== "all" || filters.unit !== "all" || filters.category !== "all" || searchTerm !== "";

  const handleAddProduct = () => {
    const sanitizedArticle = sanitizeString(newProduct.article);
    const sanitizedName = sanitizeString(newProduct.name);
    const sanitizedCategory = sanitizeString(newProduct.category);
    const sanitizedDescription = sanitizeString(newProduct.description);

    if (!sanitizedArticle || !sanitizedName) {
      toast({
        title: "Xəta",
        description: "Artikul və Məhsul Adı sahələri məcburidir",
        variant: "destructive"
      });
      return;
    }

    const product = {
      id: sanitizedArticle,
      article: sanitizedArticle,
      name: sanitizedName,
      category: sanitizedCategory || "",
      status: "active" as const,
      stock: sanitizeNumber(newProduct.stock),
      unit: sanitizeString(newProduct.unit) || "",
      packaging: newProduct.packaging,
      warehouses: [],
      description: sanitizedDescription
    };

    addProduct(product);
    setNewProduct({
      article: "",
      name: "",
      category: "",
      stock: "",
      unit: "",
      packaging: [],
      description: ""
    });
    setIsDialogOpen(false);
    
    toast({
      title: "Uğur",
      description: "Məhsul uğurla əlavə edildi"
    });
  };

  const columnLabels = useMemo(() => {
    const baseLabels = {
      artikul: 'Artikul',
      name: 'Məhsul Adı',
      category: 'Kateqoriya',
      location: 'Yerləşmə',
      total: 'Ümumi Miqdar',
      status: 'Vəziyyət',
      packaging: 'Paketləşdirmə',
      description: 'Təsvir'
    };

    // Add warehouse columns
    const warehouseLabels = allWarehouses.reduce((acc, warehouse) => {
      acc[`warehouse_${warehouse}`] = warehouse;
      return acc;
    }, {} as Record<string, string>);

    return { ...baseLabels, ...warehouseLabels };
  }, [allWarehouses]);

  const handleDragStart = (e: React.DragEvent, columnId: string) => {
    setDraggedColumn(columnId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, targetColumnId: string) => {
    e.preventDefault();
    if (!draggedColumn || draggedColumn === targetColumnId) return;

    const newOrder = [...columnOrder];
    const draggedIndex = newOrder.indexOf(draggedColumn);
    const targetIndex = newOrder.indexOf(targetColumnId);

    newOrder.splice(draggedIndex, 1);
    newOrder.splice(targetIndex, 0, draggedColumn);

    setColumnOrder(newOrder);
    setDraggedColumn(null);
  };

  const renderTableCell = (product: Product, columnId: string) => {
    // Handle warehouse-specific columns
    if (columnId.startsWith('warehouse_')) {
      const warehouseName = columnId.replace('warehouse_', '');
      const isProductInWarehouse = product.warehouses?.includes(warehouseName);
      
      // Get actual stock from warehouse stock store
      const warehouseQuantity = isProductInWarehouse 
        ? getProductStock(product.id, warehouseName)
        : 0;
      
      return (
        <TableCell>
          <div className="font-medium text-center">
            {isProductInWarehouse ? (
              <span className="text-foreground">
                {warehouseQuantity} {product.unit}
              </span>
            ) : (
              <span className="text-muted-foreground">-</span>
            )}
          </div>
        </TableCell>
      );
    }

    switch (columnId) {
      case 'artikul':
        return <TableCell className="font-medium">{product.article}</TableCell>;
      case 'name':
        return <TableCell>{product.name}</TableCell>;
      case 'category':
        return (
          <TableCell>
            <Badge variant="outline">{product.category}</Badge>
          </TableCell>
        );
      case 'location':
        return (
          <TableCell>
            <div className="flex gap-1 flex-wrap">
              {product.warehouses && product.warehouses.length > 0 ? (
                product.warehouses.map((warehouse, index) => (
                  <Button
                    key={`${product.id}-warehouse-${warehouse}-${index}`}
                    variant="outline"
                    size="sm"
                    className="h-6 px-2 text-xs cursor-pointer hover:bg-primary hover:text-primary-foreground"
                    onClick={() => navigate(`/warehouses/${warehouse}`)}
                  >
                    {warehouse}
                  </Button>
                ))
              ) : (
                <span className="text-muted-foreground text-sm">Anbar təyin edilməyib</span>
              )}
            </div>
          </TableCell>
        );
      case 'total':
        return (
          <TableCell>
            <div className="font-medium">
              {product.stock} {product.unit}
            </div>
          </TableCell>
        );
      case 'status':
        return (
          <TableCell>
            {getStatusBadge(product.status, product.stock)}
          </TableCell>
        );
      case 'packaging':
        return (
          <TableCell>
            <div className="flex gap-1 flex-wrap">
              {product.packaging.length > 0 ? (
                product.packaging.map((pack, index) => (
                  <Badge 
                    key={`${product.id}-pack-${pack}-${index}`} 
                    variant="outline" 
                    className="text-xs"
                  >
                    {pack}
                  </Badge>
                ))
              ) : (
                <span className="text-muted-foreground text-sm">Paketləşdirmə yoxdur</span>
              )}
            </div>
          </TableCell>
        );
      case 'description':
        return (
          <TableCell className="max-w-xs truncate" title={product.description}>
            {product.description}
          </TableCell>
        );
      default:
        return null;
    }
  };

  const handleDeleteProduct = (productId: string) => {
    removeProduct(productId);
    toast({
      title: "Uğur", 
      description: "Məhsul uğurla silindi"
    });
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct({
      article: product.article,
      name: product.name,
      category: product.category,
      stock: product.stock.toString(),
      description: product.description || ""
    });
    setIsEditDialogOpen(true);
  };

  const handleUpdateProduct = () => {
    const sanitizedArticle = sanitizeString(editingProduct?.article || "");
    const sanitizedName = sanitizeString(editingProduct?.name || "");
    const sanitizedCategory = sanitizeString(editingProduct?.category || "");
    const sanitizedDescription = sanitizeString(editingProduct?.description || "");

    if (!sanitizedArticle || !sanitizedName) {
      toast({
        title: "Xəta",
        description: "Artikul və Məhsul Adı sahələri məcburidir",
        variant: "destructive"
      });
      return;
    }

    const updates = {
      article: sanitizedArticle,
      name: sanitizedName,
      category: sanitizedCategory,
      stock: sanitizeNumber(editingProduct?.stock || "0"),
      description: sanitizedDescription
    };

    // Find the original product to get its ID
    const originalProduct = products.find(p => p.article === editingProduct.article);
    if (originalProduct) {
      updateProduct(originalProduct.id, updates);
      setEditingProduct(null);
      setIsEditDialogOpen(false);
      
      toast({
        title: "Uğur",
        description: "Məhsul uğurla yeniləndi"
      });
    }
  };

  const handleExcelImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const data = e.target?.result;
        if (!data) {
          toast({
            title: "Xəta",
            description: "Fayl oxuna bilmədi",
            variant: "destructive"
          });
          return;
        }

        const workbook = XLSX.read(data, { type: 'binary' });
        const firstSheetName = workbook.SheetNames[0];
        
        if (!firstSheetName) {
          toast({
            title: "Xəta", 
            description: "Excel faylında sheet tapılmadı",
            variant: "destructive"
          });
          return;
        }

        const worksheet = workbook.Sheets[firstSheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);

        if (jsonData.length === 0) {
          toast({
            title: "Xəta",
            description: "Excel faylında məlumat tapılmadı.",
            variant: "destructive"
          });
          return;
        }

        let importedCount = 0;
        let errorCount = 0;
        const errorMessages: string[] = [];

        // Check first row to understand column structure
        const firstRow = jsonData[0] as Record<string, unknown>;
        const availableColumns = Object.keys(firstRow);
        
        if (process.env.NODE_ENV === 'development' && import.meta.env.DEV) {
          console.log("Available columns:", availableColumns);
        }

        for (let index = 0; index < jsonData.length; index++) {
          const row = jsonData[index] as Record<string, unknown>;
          
          try {
            // More flexible column matching (case insensitive and multiple variations)
            const getColumnValue = (possibleNames: string[]): string | null => {
              for (const name of possibleNames) {
                for (const col of availableColumns) {
                  if (col.toLowerCase().includes(name.toLowerCase()) || 
                      name.toLowerCase().includes(col.toLowerCase())) {
                    return row[col] ? String(row[col]) : null;
                  }
                }
              }
              return null;
            };

            const article = getColumnValue(['artikul', 'artikel', 'article', 'kod', 'code']);
            const name = getColumnValue(['ad', 'adı', 'name', 'məhsul', 'product', 'başlıq']);
            const category = getColumnValue(['kateqoriya', 'category', 'tip', 'type', 'növ']);
            const stockValue = getColumnValue(['stok', 'stock', 'miqdar', 'quantity', 'say']);
            const unit = getColumnValue(['vahid', 'unit', 'ölçü', 'measure']) || 'ədəd';
            const description = getColumnValue(['təsvir', 'description', 'açıqlama', 'qeyd']);

            if (process.env.NODE_ENV === 'development' && import.meta.env.DEV) {
              console.log(`Row ${index + 1}:`, { article, name, category, stockValue, unit });
            }

            if (!article || !name) {
              errorMessages.push(`Sətir ${index + 2}: Artikul və ya məhsul adı boşdur`);
              errorCount++;
              continue;
            }

            const stock = stockValue ? parseInt(stockValue) : 0;
            if (isNaN(stock)) {
              errorMessages.push(`Sətir ${index + 2}: Stock dəyəri düzgün deyil`);
              errorCount++;
              continue;
            }

            // Check if product already exists
            const existingProduct = products.find(p => p.article === article);
            if (existingProduct) {
              // Update existing product
              updateProduct(existingProduct.id, {
                name: name,
                category: category || existingProduct.category,
                stock: stock,
                unit: unit,
                description: description || existingProduct.description
              });
            } else {
              // Add new product
              const newProduct: Product = {
                id: article,
                article: article,
                name: name,
                category: category || '',
                status: stock > 0 ? 'active' as const : 'out_of_stock' as const,
                stock: stock,
                unit: unit,
                packaging: [],
                warehouses: [],
                description: description || ''
              };
              addProduct(newProduct);
            }
            importedCount++;
          } catch (error) {
            errorMessages.push(`Sətir ${index + 2}: ${error instanceof Error ? error.message : 'Unknown error'}`);
            errorCount++;
          }
        }

        if (importedCount === 0) {
          toast({
            title: "Import uğursuz",
            description: `Heç bir məhsul import edilmədi. Mövcud sütunlar: ${availableColumns.join(', ')}. Gözlənilən sütunlar: Artikul, Ad/Məhsul Adı`,
            variant: "destructive"
          });
        } else {
          toast({
            title: "Import tamamlandı",
            description: `${importedCount} məhsul uğurla import edildi. ${errorCount > 0 ? `${errorCount} xəta oldu.` : ''}`,
            variant: errorCount > 0 ? "destructive" : "default"
          });
        }

        if (errorMessages.length > 0 && errorMessages.length <= 5) {
          if (process.env.NODE_ENV === 'development' && import.meta.env.DEV) {
            console.log("Import xətaları:", errorMessages);
          }
        }

      } catch (error) {
        if (process.env.NODE_ENV === 'development' && import.meta.env.DEV) {
          console.error("Excel import error:", error);
        }
        toast({
          title: "Xəta",
          description: "Excel faylı oxunarkən xəta baş verdi. Fayl formatını yoxlayın.",
          variant: "destructive"
        });
      }
    };
    reader.readAsBinaryString(file);
    
    // Reset input
    event.target.value = '';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Məhsullar</h1>
          <p className="text-muted-foreground">Bütün məhsulların siyahısı və məlumatları</p>
        </div>
        <div className="flex items-center gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="icon" aria-label="Sütun tənzimləmələri">
                <Settings className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80" align="end">
              <div className="space-y-4">
                <h4 className="font-medium leading-none">Sütun Tənzimləmələri</h4>
                <div className="space-y-3">
                  {columnOrder.map((columnId) => (
                    <div 
                      key={columnId}
                      className="flex items-center space-x-2 p-2 rounded hover:bg-muted/50 cursor-move"
                      draggable
                      onDragStart={(e) => handleDragStart(e, columnId)}
                      onDragOver={handleDragOver}
                      onDrop={(e) => handleDrop(e, columnId)}
                    >
                      <GripVertical className="h-4 w-4 text-muted-foreground" />
                      <Checkbox 
                        id={columnId}
                        checked={columnVisibility[columnId as keyof typeof columnVisibility]}
                        onCheckedChange={(checked) => 
                          setColumnVisibility(prev => ({ ...prev, [columnId]: checked as boolean }))
                        }
                      />
                      <Label htmlFor={columnId} className="flex-1 cursor-move">
                        {columnLabels[columnId as keyof typeof columnLabels]}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            </PopoverContent>
          </Popover>
          
          <div>
            <Label htmlFor="excel-upload" className="sr-only">Excel faylı yüklə</Label>
            <input
              type="file"
              accept=".xlsx,.xls"
              onChange={handleExcelImport}
              style={{ display: 'none' }}
              id="excel-upload"
            />
            <Button 
              variant="outline" 
              onClick={() => {
                const uploadElement = document.getElementById('excel-upload') as HTMLInputElement;
                uploadElement?.click();
              }}
            >
              <Upload className="mr-2 h-4 w-4" />
              Excel Import
            </Button>
          </div>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Yeni Məhsul
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Yeni Məhsul Əlavə Et</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="article">Artikul *</Label>
                <Input
                  id="article"
                  value={newProduct.article}
                  onChange={(e) => setNewProduct(prev => ({ ...prev, article: e.target.value }))}
                  placeholder="Məs: ALB-004"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="name">Məhsul Adı *</Label>
                <Input
                  id="name"
                  value={newProduct.name}
                  onChange={(e) => setNewProduct(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Məhsulun adını daxil edin"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="category">Kateqoriya</Label>
                <Input
                  id="category"
                  value={newProduct.category}
                  onChange={(e) => setNewProduct(prev => ({ ...prev, category: e.target.value }))}
                  placeholder="Məs: Albalı, Qarağat, Mango"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="stock">Stok</Label>
                <Input
                  id="stock"
                  type="number"
                  value={newProduct.stock}
                  onChange={(e) => setNewProduct(prev => ({ ...prev, stock: e.target.value }))}
                  placeholder="0"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="unit">Ölçü Vahidi</Label>
                <Select value={newProduct.unit} onValueChange={(value) => setNewProduct(prev => ({ ...prev, unit: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Ölçü vahidini seçin" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="kg">Kiloqram (kg)</SelectItem>
                    <SelectItem value="ədəd">Ədəd</SelectItem>
                    <SelectItem value="litr">Litr</SelectItem>
                    <SelectItem value="metr">Metr (m)</SelectItem>
                    <SelectItem value="sm">Santimetr (sm)</SelectItem>
                    <SelectItem value="qutu">Qutu</SelectItem>
                    <SelectItem value="paket">Paket</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">Təsvir</Label>
                <Textarea
                  id="description"
                  value={newProduct.description}
                  onChange={(e) => setNewProduct(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Məhsul haqqında qısa məlumat"
                  rows={3}
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Ləğv et
              </Button>
              <Button onClick={handleAddProduct}>
                Əlavə et
              </Button>
            </div>
          </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Edit Product Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Məhsulu Redaktə Et</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-article">Artikul *</Label>
              <Input
                id="edit-article"
                value={editingProduct?.article || ""}
                onChange={(e) => setEditingProduct(prev => ({ ...prev, article: e.target.value }))}
                placeholder="Məs: ALB-004"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-name">Məhsul Adı *</Label>
              <Input
                id="edit-name"
                value={editingProduct?.name || ""}
                onChange={(e) => setEditingProduct(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Məhsulun adını daxil edin"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-category">Kateqoriya</Label>
              <Input
                id="edit-category"
                value={editingProduct?.category || ""}
                onChange={(e) => setEditingProduct(prev => ({ ...prev, category: e.target.value }))}
                placeholder="Məs: Albalı, Qarağat, Mango"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-stock">Stok</Label>
              <Input
                id="edit-stock"
                type="number"
                value={editingProduct?.stock || ""}
                onChange={(e) => setEditingProduct(prev => ({ ...prev, stock: e.target.value }))}
                placeholder="0"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-description">Təsvir</Label>
              <Textarea
                id="edit-description"
                value={editingProduct?.description || ""}
                onChange={(e) => setEditingProduct(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Məhsul haqqında qısa məlumat"
                rows={3}
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Ləğv et
            </Button>
            <Button onClick={handleUpdateProduct}>
              Yadda saxla
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2 flex-1">
          <Search className="h-4 w-4 text-muted-foreground" />
          <Label htmlFor="search-input" className="sr-only">Məhsul axtarışı</Label>
          <Input 
            id="search-input"
            placeholder="Məhsul adı və ya artikul axtar..." 
            className="max-w-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center space-x-2">
          <Popover open={isFiltersOpen} onOpenChange={setIsFiltersOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline" className="gap-2">
                <Filter className="h-4 w-4" />
                Filterlər
                {hasActiveFilters && (
                  <Badge variant="secondary" className="ml-1 h-5 w-5 p-0 text-xs">
                    !
                  </Badge>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80" align="end">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium leading-none">Filterlər</h4>
                  {hasActiveFilters && (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={clearAllFilters}
                      className="h-auto p-1 text-xs"
                    >
                      <X className="h-3 w-3 mr-1" />
                      Təmizlə
                    </Button>
                  )}
                </div>
                
                <div className="space-y-3">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Vəziyyət</Label>
                    <Select 
                      value={filters.status} 
                      onValueChange={(value) => setFilters(prev => ({ ...prev, status: value }))}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Vəziyyət seçin" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Hamısı</SelectItem>
                        <SelectItem value="active">Aktiv</SelectItem>
                        <SelectItem value="low_stock">Az qalıb</SelectItem>
                        <SelectItem value="out_of_stock">Bitib</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Stok Səviyyəsi</Label>
                    <Select 
                      value={filters.stockLevel} 
                      onValueChange={(value) => setFilters(prev => ({ ...prev, stockLevel: value }))}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Stok səviyyəsi seçin" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Hamısı</SelectItem>
                        <SelectItem value="in_stock">Mövcud (≥50)</SelectItem>
                        <SelectItem value="low_stock">Az qalıb (1-49)</SelectItem>
                        <SelectItem value="out_of_stock">Bitib (0)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                   <div className="space-y-2">
                     <Label className="text-sm font-medium">Ölçü Vahidi</Label>
                     <Select 
                       value={filters.unit} 
                       onValueChange={(value) => setFilters(prev => ({ ...prev, unit: value }))}
                     >
                       <SelectTrigger className="w-full">
                         <SelectValue placeholder="Ölçü vahidi seçin" />
                       </SelectTrigger>
                       <SelectContent>
                         <SelectItem value="all">Hamısı</SelectItem>
                         {allUnits.filter(unit => unit !== "all").map(unit => (
                           <SelectItem key={unit} value={unit}>{unit}</SelectItem>
                         ))}
                       </SelectContent>
                     </Select>
                   </div>

                   <div className="space-y-2">
                     <Label className="text-sm font-medium">Kateqoriya</Label>
                     <Select 
                       value={filters.category} 
                       onValueChange={(value) => setFilters(prev => ({ ...prev, category: value }))}
                     >
                       <SelectTrigger className="w-full">
                         <SelectValue placeholder="Kateqoriya seçin" />
                       </SelectTrigger>
                       <SelectContent>
                         <SelectItem value="all">Bütün kateqoriyalar</SelectItem>
                         {categories.filter(cat => cat !== "all").map(category => (
                           <SelectItem key={category} value={category}>{category}</SelectItem>
                         ))}
                       </SelectContent>
                     </Select>
                   </div>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Məhsullar Siyahısı ({filteredProducts.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  {columnOrder.map(columnId => {
                    if (!columnVisibility[columnId as keyof typeof columnVisibility]) return null;
                    
                    return (
                      <TableHead 
                        key={columnId} 
                        className={
                          columnId === 'name' ? 'min-w-[200px]' : 
                          columnId === 'description' ? 'min-w-[150px]' : 
                          columnId === 'location' ? 'min-w-[180px]' :
                          'min-w-[100px]'
                        }
                      >
                        {columnLabels[columnId as keyof typeof columnLabels]}
                      </TableHead>
                    );
                  })}
                  <TableHead className="min-w-[120px]">Əməliyyatlar</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProducts.length === 0 ? (
                  <TableRow>
                    <TableCell 
                      colSpan={columnOrder.filter(c => columnVisibility[c as keyof typeof columnVisibility]).length + 1} 
                      className="text-center py-8 text-muted-foreground"
                    >
                      <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>Axtarış şərtinə uyğun məhsul tapılmadı</p>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredProducts.map((product) => (
                    <TableRow key={product.id}>
                      {columnOrder.map(columnId => {
                        if (!columnVisibility[columnId as keyof typeof columnVisibility]) return null;
                        return renderTableCell(product, columnId);
                      })}
                      <TableCell>
                        <div className="flex gap-1">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8"
                            onClick={() => handleEditProduct(product)}
                            title="Məhsulu redaktə et"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-8 w-8 hover:bg-destructive/10 hover:text-destructive"
                                title="Məhsulu sil"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Məhsulu sil</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Bu məhsulu silmək istədiyinizə əminsiniz? Bu əməliyyat geri qaytarıla bilməz.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Ləğv et</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDeleteProduct(product.id)}>
                                  Sil
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}