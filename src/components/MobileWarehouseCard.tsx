import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Package, MapPin, ChevronDown, ChevronUp } from "lucide-react";
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
  const [isExpanded, setIsExpanded] = useState(false);

  const hasAdditionalInfo = product.packaging.length > 0 || 
    (product.warehouses && product.warehouses.length > 1);

  return (
    <MobileContainer>
      <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
        <Card className="w-full">
          <CollapsibleTrigger asChild>
            <CardContent className="p-4 cursor-pointer hover:bg-muted/50 transition-colors">
              <div className="space-y-3">
                {/* Header with status and article */}
                <MobileFlexBetween className="items-start">
                  <div className="flex-1 min-w-0 pr-3 overflow-hidden">
                    <MobileText variant="subtitle" className="block truncate font-medium leading-tight mb-1">
                      {product.name}
                    </MobileText>
                    <MobileText variant="caption" className="block truncate">
                      {product.article}
                    </MobileText>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0 ml-auto">
                    {getStatusBadge(product.status, product.stock)}
                    {hasAdditionalInfo && (
                      isExpanded ? (
                        <ChevronUp className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <ChevronDown className="h-4 w-4 text-muted-foreground" />
                      )
                    )}
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
              </div>
            </CardContent>
          </CollapsibleTrigger>
          
          {hasAdditionalInfo && (
            <CollapsibleContent>
              <CardContent className="px-4 pb-4 pt-0 space-y-3 border-t bg-muted/20">
                {/* Packaging */}
                {product.packaging.length > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Package className="h-3 w-3" />
                      <span>{dynamicPackagingLabel}:</span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {product.packaging.map((pack, index) => (
                        <Badge 
                          key={`${product.id}-pack-${pack.type}-${index}`} 
                          variant="outline" 
                          className="text-xs bg-accent/50"
                        >
                          {pack.type}×{pack.quantity}
                        </Badge>
                      ))}
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
                        .map((warehouse, index) => (
                          <Button
                            key={`${product.id}-warehouse-${warehouse}-${index}`}
                            variant="outline"
                            size="sm"
                            className="h-6 px-2 text-xs"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/warehouses/${encodeURIComponent(warehouse)}`);
                            }}
                          >
                            {warehouse}
                          </Button>
                        ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </CollapsibleContent>
          )}
        </Card>
      </Collapsible>
    </MobileContainer>
  );
}
