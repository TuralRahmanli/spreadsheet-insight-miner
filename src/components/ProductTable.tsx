import { useState, useMemo, useEffect } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { GripVertical } from "lucide-react";
import { Product } from "@/types";
import { ProductDialog } from "./ProductDialog";
import { ProductTableColumns } from "./ProductTableColumns";
import { ProductTableActions } from "./ProductTableActions";
import { ProductTableSettings } from "./ProductTableSettings";
import { usePackagingMethodsStore } from "@/lib/packagingMethodsStore";

interface ProductTableProps {
  products: Product[];
  searchTerm: string;
  hasActiveFilters: boolean;
  getStatusBadge: (status: string, stock: number) => React.ReactNode;
  selectedProducts?: Set<string>;
  onSelectProduct?: (productId: string, checked: boolean) => void;
  showSelection?: boolean;
}

export function ProductTable({ 
  products, 
  searchTerm, 
  hasActiveFilters, 
  getStatusBadge,
  selectedProducts = new Set(),
  onSelectProduct,
  showSelection = false
}: ProductTableProps) {
  const { packagingMethods } = usePackagingMethodsStore();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Get all unique warehouses - memoized to prevent infinite re-renders
  const allWarehouses = useMemo(() => 
    Array.from(new Set(products.flatMap(p => p.warehouses || []))), 
    [products]
  );
  
  // Column visibility state - memoized initial state
  const [columnVisibility, setColumnVisibility] = useState(() => ({
    artikul: true,
    name: true,
    category: true,
    location: true,
    total: true,
    status: true,
    packaging: true,
    description: true
  }));

  // Column order - dynamically updated when warehouses change
  const [columnOrder, setColumnOrder] = useState<string[]>([
    'status', 'artikul', 'name', 'location', 'packaging',
    'total', 'category', 'description'
  ]);

  // Update column order and visibility when warehouses change
  useEffect(() => {
    const warehouseColumns = allWarehouses.map(warehouse => `warehouse_${warehouse}`);
    const newOrder = [
      'status', 'artikul', 'name', 'location', 'packaging',
      ...warehouseColumns,
      'total', 'category', 'description'
    ];
    
    setColumnOrder(newOrder);
    
    // Add new warehouse columns to visibility
    setColumnVisibility(prev => {
      const newVisibility = { ...prev };
      warehouseColumns.forEach(col => {
        if (!(col in newVisibility)) {
          newVisibility[col] = true;
        }
      });
      return newVisibility;
    });
  }, [allWarehouses]);

  // Get the first packaging method from store or default to "Paket"
  const getPackagingColumnHeader = () => {
    return packagingMethods.length > 0 ? packagingMethods[0] : "Paket";
  };

  const columnLabels = useMemo(() => ({
    artikul: 'Artikul',
    name: 'Məhsul Adı', 
    category: 'Kateqoriya',
    location: 'Yerləşmə',
    total: 'Ümumi',
    status: 'Vəziyyət',
    packaging: getPackagingColumnHeader(),
    description: 'Təsvir',
    ...allWarehouses.reduce((acc, warehouse) => ({ ...acc, [`warehouse_${warehouse}`]: warehouse }), {})
  }), [allWarehouses, packagingMethods]);

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setIsEditDialogOpen(true);
  };

  const handleColumnVisibilityChange = (visibility: Record<string, boolean>) => {
    setColumnVisibility(prev => ({ ...prev, ...visibility }));
  };

  const handleColumnOrderChange = (newOrder: string[]) => {
    setColumnOrder(newOrder);
  };

  return (
    <div className="space-y-4">
      {/* Column Settings */}
      <div className="flex justify-end">
        <ProductTableSettings
          columnLabels={columnLabels}
          columnVisibility={columnVisibility}
          columnOrder={columnOrder}
          onColumnVisibilityChange={handleColumnVisibilityChange}
          onColumnOrderChange={handleColumnOrderChange}
        />
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              {showSelection && onSelectProduct && (
                <TableHead className="w-[50px]">
                  <Checkbox
                    checked={products.length > 0 && products.every(p => selectedProducts.has(p.id))}
                    onCheckedChange={(checked) => {
                      products.forEach(p => onSelectProduct(p.id, !!checked));
                    }}
                  />
                </TableHead>
              )}
              {columnOrder
                .filter(columnId => columnVisibility[columnId])
                .map((columnId) => (
                  <TableHead key={columnId} className="min-w-[120px] whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <GripVertical className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                      <span className="truncate">{columnLabels[columnId]}</span>
                    </div>
                  </TableHead>
                ))}
              <TableHead className="w-[100px] whitespace-nowrap">Əməliyyatlar</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.length === 0 ? (
              <TableRow>
                <TableCell 
                  colSpan={columnOrder.filter(col => columnVisibility[col]).length + 1 + (showSelection ? 1 : 0)} 
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
                  {showSelection && onSelectProduct && (
                    <TableCell>
                      <Checkbox
                        checked={selectedProducts.has(product.id)}
                        onCheckedChange={(checked) => onSelectProduct(product.id, !!checked)}
                      />
                    </TableCell>
                  )}
                  {columnOrder
                    .filter(columnId => columnVisibility[columnId])
                    .map((columnId) => (
                      <ProductTableColumns
                        key={columnId}
                        product={product}
                        columnId={columnId}
                        getStatusBadge={getStatusBadge}
                      />
                    ))}
                  <TableCell className="whitespace-nowrap">
                    <ProductTableActions
                      product={product}
                      onEdit={handleEditProduct}
                    />
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