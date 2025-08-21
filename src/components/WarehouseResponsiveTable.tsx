import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Package } from "lucide-react";
import { Product } from "@/types";
import { useNavigate } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";
import { MobileWarehouseCard } from "./MobileWarehouseCard";
import React, { useState, useEffect } from "react";
import { ProductTableSettings } from "./ProductTableSettings";

interface WarehouseResponsiveTableProps {
  products: Product[];
  warehouseName: string;
  getStatusBadge: (status: string, stock: number) => React.ReactNode;
  dynamicPackagingLabel: string;
  searchTerm: string;
  showSettings?: boolean;
}

export function WarehouseResponsiveTable({ 
  products, 
  warehouseName, 
  getStatusBadge, 
  dynamicPackagingLabel, 
  searchTerm,
  showSettings = false
}: WarehouseResponsiveTableProps) {
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  // Define column labels
  const columnLabels: Record<string, string> = {
    status: "Vəziyyət",
    article: "Artikul", 
    name: "Məhsul Adı",
    packaging: "Paketləşdirmə",
    package: "Paket",
    stock: "Stok",
    warehouses: "Digər Anbarlar",
    category: "Kateqoriya"
  };

  // Initialize column visibility and order
  const [columnVisibility, setColumnVisibility] = useState<Record<string, boolean>>({
    status: true,
    article: true,
    name: true,
    packaging: true,
    package: true,
    stock: true,
    warehouses: true,
    category: true
  });

  const [columnOrder, setColumnOrder] = useState<string[]>([
    "status",
    "article", 
    "name",
    "packaging",
    "package",
    "stock",
    "warehouses",
    "category"
  ]);

  // Filter visible columns based on settings
  const visibleColumns = columnOrder.filter(column => columnVisibility[column]);

  if (products.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
        <p>Bu anbarda {searchTerm ? 'axtarış şərtinə uyğun' : ''} məhsul tapılmadı</p>
      </div>
    );
  }

  if (isMobile) {
    return (
      <div className="space-y-4">
        {products.map((product) => (
          <MobileWarehouseCard
            key={product.id}
            product={product}
            currentWarehouse={warehouseName}
            getStatusBadge={getStatusBadge}
            dynamicPackagingLabel={dynamicPackagingLabel}
          />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {showSettings && (
        <div className="flex justify-end">
          <ProductTableSettings
            columnLabels={columnLabels}
            columnVisibility={columnVisibility}
            columnOrder={columnOrder}
            onColumnVisibilityChange={setColumnVisibility}
            onColumnOrderChange={setColumnOrder}
          />
        </div>
      )}
      
      <div className="overflow-x-auto rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              {visibleColumns.map((columnKey) => (
                <TableHead key={columnKey} className="whitespace-nowrap">
                  {columnLabels[columnKey]}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map((product) => {
              const renderCell = (columnKey: string) => {
                switch (columnKey) {
                  case 'status':
                    return <TableCell className="whitespace-nowrap">{getStatusBadge(product.status, product.stock)}</TableCell>;
                  case 'article':
                    return <TableCell className="font-medium whitespace-nowrap">{product.article}</TableCell>;
                  case 'name':
                    return <TableCell className="max-w-[200px] truncate">{product.name}</TableCell>;
                  case 'packaging':
                    return (
                      <TableCell>
                        <div className="flex gap-1 flex-wrap max-w-[120px]">
                          {product.packaging.length > 0 ? (
                            [...new Set(product.packaging.map(pack => pack.method || 'Yoxdur'))].map((method, index) => (
                              <Badge 
                                key={`${product.id}-method-${method}-${index}`} 
                                variant="secondary" 
                                className="text-xs whitespace-nowrap"
                              >
                                {method}
                              </Badge>
                            ))
                          ) : (
                            <span className="text-muted-foreground text-xs">Yoxdur</span>
                          )}
                        </div>
                      </TableCell>
                    );
                  case 'package':
                    return (
                      <TableCell>
                        <div className="flex gap-1 flex-wrap max-w-[120px]">
                          {product.packaging.length > 0 ? (
                            product.packaging.map((pack, index) => (
                              <Badge 
                                key={`${product.id}-pack-${pack.type}-${index}`} 
                                variant="outline" 
                                className="text-xs bg-accent/50 whitespace-nowrap"
                              >
                                {pack.type}×{pack.quantity}
                              </Badge>
                            ))
                          ) : (
                            <span className="text-muted-foreground text-xs">Yoxdur</span>
                          )}
                        </div>
                      </TableCell>
                    );
                  case 'stock':
                    return <TableCell className="whitespace-nowrap">{product.stock} {product.unit}</TableCell>;
                  case 'warehouses':
                    return (
                      <TableCell>
                        <div className="flex gap-1 flex-wrap max-w-[150px]">
                          {product.warehouses
                            ?.filter(w => w !== warehouseName)
                            .map((otherWarehouse, index) => (
                              <Badge 
                                key={`${product.id}-other-warehouse-${otherWarehouse}-${index}`} 
                                variant="secondary" 
                                className="text-xs cursor-pointer hover:bg-secondary/80 whitespace-nowrap"
                                onClick={() => navigate(`/warehouses/${encodeURIComponent(otherWarehouse)}`)}
                              >
                                {otherWarehouse}
                              </Badge>
                            ))}
                          {(product.warehouses?.filter(w => w !== warehouseName).length || 0) === 0 && (
                            <span className="text-muted-foreground text-sm">Yalnız bu anbarda</span>
                          )}
                        </div>
                      </TableCell>
                    );
                  case 'category':
                    return <TableCell><Badge variant="outline" className="whitespace-nowrap">{product.category}</Badge></TableCell>;
                  default:
                    return <TableCell></TableCell>;
                }
              };

              return (
                <TableRow key={product.id}>
                  {visibleColumns.map((columnKey) => (
                    <React.Fragment key={`${product.id}-${columnKey}`}>
                      {renderCell(columnKey)}
                    </React.Fragment>
                  ))}
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}