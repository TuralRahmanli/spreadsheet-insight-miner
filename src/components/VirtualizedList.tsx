import { memo, useMemo, useState, useCallback } from "react";
import { FixedSizeList as List } from "react-window";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Package } from "lucide-react";

interface Product {
  id: string;
  article: string;
  name: string;
  category: string;
  status: string;
  stock: number;
  unit: string;
  packaging: string[];
  warehouses: string[];
  description?: string;
}

interface VirtualizedListProps {
  products: Product[];
  height?: number;
  itemHeight?: number;
  onProductSelect?: (product: Product) => void;
}

const ProductItem = memo(({ index, style, data }: { 
  index: number; 
  style: React.CSSProperties;
  data: { products: Product[]; onProductSelect?: (product: Product) => void }
}) => {
  const { products, onProductSelect } = data;
  const product = products[index];

  const getStatusBadge = useCallback((status: string, stock: number) => {
    if (status === "out_of_stock" || stock === 0) {
      return <Badge variant="destructive" className="text-xs">Bitib</Badge>;
    }
    if (status === "low_stock" || stock < 50) {
      return <Badge variant="secondary" className="bg-warning text-warning-foreground text-xs">Az qalıb</Badge>;
    }
    return <Badge variant="secondary" className="bg-success text-success-foreground text-xs">Mövcud</Badge>;
  }, []);

  return (
    <div style={style} className="px-2">
      <Card 
        className="mb-2 cursor-pointer hover:shadow-md transition-shadow"
        onClick={() => onProductSelect?.(product)}
      >
        <CardContent className="p-4">
          <div className="flex items-start justify-between mb-2">
            <div className="flex items-center gap-2">
              <Package className="h-4 w-4 text-primary" />
              <div>
                <h3 className="font-medium text-sm">{product.name}</h3>
                <p className="text-xs text-muted-foreground">{product.article}</p>
              </div>
            </div>
            {getStatusBadge(product.status, product.stock)}
          </div>
          
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <span className="text-muted-foreground">Kateqoriya:</span>
              <Badge variant="outline" className="ml-1 text-xs">{product.category}</Badge>
            </div>
            <div>
              <span className="text-muted-foreground">Stok:</span>
              <span className="ml-1 font-medium">{product.stock} {product.unit}</span>
            </div>
          </div>

          {product.warehouses.length > 0 && (
            <div className="mt-2">
              <span className="text-xs text-muted-foreground">Anbarlar:</span>
              <div className="flex gap-1 flex-wrap mt-1">
                {product.warehouses.slice(0, 2).map((warehouse, idx) => (
                  <Badge key={idx} variant="secondary" className="text-xs">
                    {warehouse}
                  </Badge>
                ))}
                {product.warehouses.length > 2 && (
                  <Badge variant="secondary" className="text-xs">
                    +{product.warehouses.length - 2}
                  </Badge>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
});

ProductItem.displayName = "ProductItem";

export const VirtualizedList = memo(({ 
  products, 
  height = 400, 
  itemHeight = 120,
  onProductSelect 
}: VirtualizedListProps) => {
  const itemData = useMemo(() => ({
    products,
    onProductSelect
  }), [products, onProductSelect]);

  if (products.length === 0) {
    return (
      <div className="text-center py-8">
        <Package className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
        <p className="text-muted-foreground">Məhsul tapılmadı</p>
      </div>
    );
  }

  return (
    <List
      height={height}
      width="100%"
      itemCount={products.length}
      itemSize={itemHeight}
      itemData={itemData}
      className="overflow-auto"
    >
      {ProductItem}
    </List>
  );
});

VirtualizedList.displayName = "VirtualizedList";