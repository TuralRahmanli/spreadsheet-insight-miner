import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TableCell } from "@/components/ui/table";
import { useNavigate } from "react-router-dom";
import { useWarehouseStockStore } from "@/lib/warehouseStockStore";
import { Product } from "@/types";

interface ProductTableColumnsProps {
  product: Product;
  columnId: string;
  getStatusBadge: (status: string, stock: number) => React.ReactNode;
}

export function ProductTableColumns({ product, columnId, getStatusBadge }: ProductTableColumnsProps) {
  const navigate = useNavigate();
  const { getProductStock } = useWarehouseStockStore();

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
      return <TableCell key={columnId} className="max-w-[200px] truncate" title={product.name}>{product.name}</TableCell>;
    case 'category':
      return (
        <TableCell key={columnId}>
          <Badge variant="outline" className="bg-secondary/50">{product.category}</Badge>
        </TableCell>
      );
    case 'location':
      return (
        <TableCell key={columnId}>
          <div className="flex gap-1 flex-wrap max-w-[150px]">
            {product.warehouses && product.warehouses.length > 0 ? (
              product.warehouses.slice(0, 2).map((warehouse, index) => (
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
              <span className="text-muted-foreground text-xs">Anbar yoxdur</span>
            )}
            {product.warehouses && product.warehouses.length > 2 && (
              <Badge variant="secondary" className="h-6 px-2 text-xs">
                +{product.warehouses.length - 2}
              </Badge>
            )}
          </div>
        </TableCell>
      );
    case 'total':
      return (
        <TableCell key={columnId}>
          <div className="font-medium text-right">
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
          <div className="flex gap-1 flex-wrap max-w-[120px]">
            {product.packaging.length > 0 ? (
              product.packaging.slice(0, 2).map((pack, index) => (
                <Badge 
                  key={`${product.id}-pack-${pack}-${index}`} 
                  variant="outline" 
                  className="text-xs bg-accent/50"
                >
                  {pack}
                </Badge>
              ))
            ) : (
              <span className="text-muted-foreground text-xs">Yoxdur</span>
            )}
            {product.packaging.length > 2 && (
              <Badge variant="secondary" className="text-xs">
                +{product.packaging.length - 2}
              </Badge>
            )}
          </div>
        </TableCell>
      );
    case 'description':
      return (
        <TableCell key={columnId} className="max-w-[150px] truncate" title={product.description}>
          {product.description}
        </TableCell>
      );
    default:
      return <TableCell key={columnId}></TableCell>;
  }
}