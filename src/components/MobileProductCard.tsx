import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, MapPin } from "lucide-react";
import { Product } from "@/types";
import { useNavigate } from "react-router-dom";

interface MobileProductCardProps {
  product: Product;
  getStatusBadge: (status: string, stock: number) => React.ReactNode;
  onEdit: (product: Product) => void;
  onDelete: (productId: string) => void;
}

export function MobileProductCard({ product, getStatusBadge, onEdit, onDelete }: MobileProductCardProps) {
  const navigate = useNavigate();

  return (
    <Card className="w-full">
      <CardContent className="p-4 space-y-3">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <h3 className="font-medium truncate">{product.name}</h3>
            <p className="text-sm text-muted-foreground">{product.article}</p>
          </div>
          <div className="flex items-center gap-1 ml-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEdit(product)}
              className="h-8 w-8 p-0"
            >
              <Edit className="h-3 w-3" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(product.id)}
              className="h-8 w-8 p-0 text-destructive"
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        </div>

        {/* Info Row */}
        <div className="flex items-center justify-between">
          <Badge variant="outline" className="bg-secondary/50">
            {product.category}
          </Badge>
          {getStatusBadge(product.status, product.stock)}
        </div>

        {/* Stock */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Miqdar:</span>
          <span className="font-medium">{product.stock} {product.unit}</span>
        </div>

        {/* Warehouses */}
        {product.warehouses && product.warehouses.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <MapPin className="h-3 w-3" />
              <span>Anbarlar:</span>
            </div>
            <div className="flex flex-wrap gap-1">
              {product.warehouses.slice(0, 3).map((warehouse, index) => (
                <Button
                  key={`${product.id}-warehouse-${warehouse}-${index}`}
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
              {product.packaging.slice(0, 3).map((pack, index) => (
                <Badge 
                  key={`${product.id}-pack-${pack}-${index}`} 
                  variant="outline" 
                  className="text-xs bg-accent/50"
                >
                  {pack}
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
  );
}