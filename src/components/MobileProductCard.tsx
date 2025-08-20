import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, MapPin } from "lucide-react";
import { Product } from "@/types";
import { useNavigate } from "react-router-dom";
import { MobileContainer, MobileFlexBetween, MobileText, MobileButtonGroup } from "@/components/ui/mobile-layout";

interface MobileProductCardProps {
  product: Product;
  getStatusBadge: (status: string, stock: number) => React.ReactNode;
  onEdit: (product: Product) => void;
  onDelete: (productId: string) => void;
}

export function MobileProductCard({ product, getStatusBadge, onEdit, onDelete }: MobileProductCardProps) {
  const navigate = useNavigate();

  return (
    <MobileContainer>
      <Card className="w-full">
        <CardContent className="p-4 space-y-3">
          {/* Header */}
          <MobileFlexBetween className="items-start">
            <div className="flex-1 min-w-0 pr-3 overflow-hidden">
              <MobileText variant="subtitle" className="block truncate leading-tight mb-1">{product.name}</MobileText>
              <MobileText variant="caption" className="block truncate">{product.article}</MobileText>
            </div>
            <div className="flex gap-1 flex-shrink-0 ml-auto">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onEdit(product)}
                className="h-8 w-8 p-0 flex-shrink-0"
                aria-label={`${product.name} məhsulunu redaktə et`}
              >
                <Edit className="h-3 w-3" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onDelete(product.id)}
                className="h-8 w-8 p-0 text-destructive flex-shrink-0"
                aria-label={`${product.name} məhsulunu sil`}
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          </MobileFlexBetween>

          {/* Info Row */}
          <MobileFlexBetween>
            <Badge variant="outline" className="bg-secondary/50 flex-shrink-0">
              {product.category}
            </Badge>
            <div className="flex-shrink-0">
              {getStatusBadge(product.status, product.stock)}
            </div>
          </MobileFlexBetween>

          {/* Stock */}
          <MobileFlexBetween>
            <MobileText variant="caption" className="flex-shrink-0">Miqdar:</MobileText>
            <MobileText variant="body" className="font-medium text-right">{product.stock} {product.unit}</MobileText>
          </MobileFlexBetween>

          {/* ... keep existing code (warehouses, packaging, description sections) */}
          {product.warehouses && product.warehouses.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <MapPin className="h-3 w-3" />
                <span>Anbarlar:</span>
              </div>
              <div className="flex flex-wrap gap-1">
                {product.warehouses.slice(0, 3).map((warehouse) => (
                  <Button
                    key={`${product.id}-warehouse-${warehouse}`}
                    variant="outline"
                    size="sm"
                    className="h-6 px-2 text-xs"
                    onClick={() => navigate(`/warehouses/${warehouse}`)}
                  >
                    {warehouse}
                  </Button>
                ))}
                {product.warehouses.length > 3 && (
                  <Badge variant="secondary" className="h-6 px-2 text-xs">
                    +{product.warehouses.length - 3}
                  </Badge>
                )}
              </div>
            </div>
          )}

          {/* Packaging */}
          {product.packaging.length > 0 && (
            <div className="space-y-1">
              <span className="text-sm text-muted-foreground">Paketlər:</span>
              <div className="flex flex-wrap gap-1">
                {product.packaging.slice(0, 3).map((pack) => (
                  <Badge 
                    key={`${product.id}-pack-${pack.type}`} 
                    variant="outline" 
                    className="text-xs bg-accent/50"
                  >
                    {pack.type}×{pack.quantity}
                  </Badge>
                ))}
                {product.packaging.length > 3 && (
                  <Badge variant="secondary" className="text-xs">
                    +{product.packaging.length - 3}
                  </Badge>
                )}
              </div>
            </div>
          )}

          {/* Description */}
          {product.description && (
            <p className="text-sm text-muted-foreground line-clamp-2">
              {product.description}
            </p>
          )}
        </CardContent>
      </Card>
    </MobileContainer>
  );
}