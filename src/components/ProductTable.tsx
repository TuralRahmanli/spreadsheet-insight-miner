import { useState, useMemo } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Edit, Trash2, GripVertical, Settings } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useProductStore } from "@/lib/productStore";
import { useWarehouseStockStore } from "@/lib/warehouseStockStore";
import { Product } from "@/types";
import { ProductDialog } from "./ProductDialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

interface ProductTableProps {
  products: Product[];
  searchTerm: string;
  hasActiveFilters: boolean;
  getStatusBadge: (status: string, stock: number) => React.ReactNode;
}

export function ProductTable({ products, searchTerm, hasActiveFilters, getStatusBadge }: ProductTableProps) {
  const navigate = useNavigate();
  const { removeProduct } = useProductStore();
  const { getProductStock } = useWarehouseStockStore();
  const { toast } = useToast();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Get all unique warehouses
  const allWarehouses = Array.from(new Set(products.flatMap(p => p.warehouses || [])));
  
  // Column visibility state
  const [columnVisibility, setColumnVisibility] = useState({
    artikul: true,
    name: true,
    category: true,
    location: true,
    ...allWarehouses.reduce((acc, warehouse) => ({ ...acc, [`warehouse_${warehouse}`]: true }), {}),
    total: true,
    status: true,
    packaging: true,
    description: true
  });

  const [columnOrder, setColumnOrder] = useState([
    'artikul', 'name', 'category', 'location',
    ...allWarehouses.map(warehouse => `warehouse_${warehouse}`),
    'total', 'status', 'packaging', 'description'
  ]);

  const columnLabels = useMemo(() => ({
    artikul: 'Artikul',
    name: 'Məhsul Adı', 
    category: 'Kateqoriya',
    location: 'Yerləşmə',
    total: 'Ümumi Miqdar',
    status: 'Vəziyyət',
    packaging: 'Paketləşdirmə',
    description: 'Təsvir',
    ...allWarehouses.reduce((acc, warehouse) => ({ ...acc, [`warehouse_${warehouse}`]: warehouse }), {})
  }), [allWarehouses]);

  const handleDeleteProduct = (productId: string) => {
    removeProduct(productId);
    toast({
      title: "Uğur",
      description: "Məhsul uğurla silindi"
    });
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setIsEditDialogOpen(true);
  };

  const renderTableCell = (product: Product, columnId: string) => {
    if (columnId.startsWith('warehouse_')) {
      const warehouseName = columnId.replace('warehouse_', '');
      const isProductInWarehouse = product.warehouses?.includes(warehouseName);
      const warehouseQuantity = isProductInWarehouse ? getProductStock(product.id, warehouseName) : 0;
      
      return (
        <TableCell key={columnId}>
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
        return <TableCell key={columnId} className="font-medium">{product.article}</TableCell>;
      case 'name':
        return <TableCell key={columnId}>{product.name}</TableCell>;
      case 'category':
        return (
          <TableCell key={columnId}>
            <Badge variant="outline">{product.category}</Badge>
          </TableCell>
        );
      case 'location':
        return (
          <TableCell key={columnId}>
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
          <TableCell key={columnId}>
            <div className="font-medium">
              {product.stock} {product.unit}
            </div>
          </TableCell>
        );
      case 'status':
        return (
          <TableCell key={columnId}>
            {getStatusBadge(product.status, product.stock)}
          </TableCell>
        );
      case 'packaging':
        return (
          <TableCell key={columnId}>
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
          <TableCell key={columnId} className="max-w-xs truncate" title={product.description}>
            {product.description}
          </TableCell>
        );
      default:
        return <TableCell key={columnId}></TableCell>;
    }
  };

  return (
    <div className="space-y-4">
      {/* Column Settings */}
      <div className="flex justify-end">
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm">
              <Settings className="mr-2 h-4 w-4" />
              Sütunlar
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80">
            <div className="space-y-4">
              <h4 className="font-medium leading-none">Sütun Görünümü</h4>
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(columnLabels).map(([key, label]) => (
                  <div key={key} className="flex items-center space-x-2">
                    <Checkbox
                      id={key}
                      checked={columnVisibility[key]}
                      onCheckedChange={(checked) =>
                        setColumnVisibility(prev => ({ ...prev, [key]: !!checked }))
                      }
                    />
                    <Label htmlFor={key} className="text-sm">{label}</Label>
                  </div>
                ))}
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              {columnOrder
                .filter(columnId => columnVisibility[columnId])
                .map((columnId) => (
                  <TableHead key={columnId} className="min-w-[100px]">
                    <div className="flex items-center gap-2">
                      <GripVertical className="h-3 w-3 text-muted-foreground" />
                      {columnLabels[columnId]}
                    </div>
                  </TableHead>
                ))}
              <TableHead className="w-[100px]">Əməliyyatlar</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.length === 0 ? (
              <TableRow>
                <TableCell 
                  colSpan={columnOrder.filter(col => columnVisibility[col]).length + 1} 
                  className="text-center py-8 text-muted-foreground"
                >
                  {searchTerm || hasActiveFilters 
                    ? "Axtarış şərtinə uyğun məhsul tapılmadı" 
                    : "Məhsul tapılmadı"
                  }
                </TableCell>
              </TableRow>
            ) : (
              products.map((product) => (
                <TableRow key={product.id}>
                  {columnOrder
                    .filter(columnId => columnVisibility[columnId])
                    .map((columnId) => renderTableCell(product, columnId))}
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditProduct(product)}
                        className="h-8 w-8 p-0"
                        title="Məhsulu redaktə et"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                            title="Məhsulu sil"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Məhsulu sil</AlertDialogTitle>
                            <AlertDialogDescription>
                              Bu məhsulu silmək istədiyinizə əminsiniz? Bu əməliyyat geri alına bilməz.
                              <br /><br />
                              <strong>Məhsul:</strong> {product.name} ({product.article})
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Ləğv et</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDeleteProduct(product.id)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
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

      {/* Edit Dialog */}
      {isEditDialogOpen && editingProduct && (
        <ProductDialog
          isOpen={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
          editingProduct={editingProduct}
        />
      )}
    </div>
  );
}