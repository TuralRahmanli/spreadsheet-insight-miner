import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Package, MapPin } from "lucide-react";
import { Product } from "@/types";
import { useNavigate } from "react-router-dom";
import { MobileContainer, MobileFlexBetween, MobileText } from "@/components/ui/mobile-layout";

interface MobileWarehouseCardProps {
  product: Product;
  currentWarehouse: string;
  getStatusBadge: (status: string, stock: number) => React.ReactNode;
  dynamicPackagingLabel: string;
}

export function MobileWarehouseCard({ 
  product, 
  currentWarehouse, 
  getStatusBadge, 
  dynamicPackagingLabel 
}: MobileWarehouseCardProps) {
  const navigate = useNavigate();

  return (
    <MobileContainer>
      <Card className="w-full">
        <CardContent className="p-4 space-y-3">
          {/* Header with status and article */}
          <MobileFlexBetween>
            <div className="flex-1 min-w-0">
              <MobileText variant="subtitle" className="truncate font-medium">
                {product.name}
              </MobileText>
              <MobileText variant="caption" className="truncate">
                {product.article}
              </MobileText>
            </div>
            <div className="flex-shrink-0">
              {getStatusBadge(product.status, product.stock)}
            </div>
          </MobileFlexBetween>

          {/* Category and Stock */}
          <MobileFlexBetween>
            <Badge variant="outline" className="bg-secondary/50 flex-shrink-0">
              {product.category}
            </Badge>
            <MobileText variant="body" className="font-medium text-right">
              {product.stock} {product.unit}
            </MobileText>
          </MobileFlexBetween>

          {/* Packaging */}
          {product.packaging.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <Package className="h-3 w-3" />
                <span>{dynamicPackagingLabel}:</span>
              </div>
              <div className="flex flex-wrap gap-1">
                {product.packaging.slice(0, 4).map((pack, index) => (
                  <Badge 
                    key={`${product.id}-pack-${pack.type}-${index}`} 
                    variant="outline" 
                    className="text-xs bg-accent/50"
                  >
                    {pack.type}×{pack.quantity}
                  </Badge>
                ))}
                {product.packaging.length > 4 && (
                  <Badge variant="secondary" className="text-xs">
                    +{product.packaging.length - 4}
                  </Badge>
                )}
              </div>
            </div>
          )}

          {/* Other Warehouses */}
          {product.warehouses && product.warehouses.length > 1 && (
            <div className="space-y-2">
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <MapPin className="h-3 w-3" />
                <span>Digər anbarlar:</span>
              </div>
              <div className="flex flex-wrap gap-1">
                {product.warehouses
                  .filter(w => w !== currentWarehouse)
                  .slice(0, 3)
                  .map((warehouse, index) => (
                    <Button
                      key={`${product.id}-warehouse-${warehouse}-${index}`}
                      variant="outline"
                      size="sm"
                      className="h-6 px-2 text-xs"
                      onClick={() => navigate(`/warehouses/${encodeURIComponent(warehouse)}`)}
                    >
                      {warehouse}
                    </Button>
                  ))}
                {product.warehouses.filter(w => w !== currentWarehouse).length > 3 && (
                  <Badge variant="secondary" className="h-6 px-2 text-xs">
                    +{product.warehouses.filter(w => w !== currentWarehouse).length - 3}
                  </Badge>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </MobileContainer>
  );
}
