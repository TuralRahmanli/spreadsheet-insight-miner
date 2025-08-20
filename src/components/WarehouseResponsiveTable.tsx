import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Package } from "lucide-react";
import { Product } from "@/types";
import { useNavigate } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";
import { MobileWarehouseCard } from "./MobileWarehouseCard";

interface WarehouseResponsiveTableProps {
  products: Product[];
  warehouseName: string;
  getStatusBadge: (status: string, stock: number) => React.ReactNode;
  dynamicPackagingLabel: string;
  searchTerm: string;
}

export function WarehouseResponsiveTable({ 
  products, 
  warehouseName, 
  getStatusBadge, 
  dynamicPackagingLabel, 
  searchTerm 
}: WarehouseResponsiveTableProps) {
  const navigate = useNavigate();
  const isMobile = useIsMobile();

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
    <div className="overflow-x-auto rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="whitespace-nowrap">Vəziyyət</TableHead>
            <TableHead className="whitespace-nowrap">Artikul</TableHead>
            <TableHead className="whitespace-nowrap">Məhsul Adı</TableHead>
            <TableHead className="whitespace-nowrap">Paket</TableHead>
            <TableHead className="whitespace-nowrap">Stok</TableHead>
            <TableHead className="whitespace-nowrap">Digər Anbarlar</TableHead>
            <TableHead className="whitespace-nowrap">Kateqoriya</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.map((product) => (
            <TableRow key={product.id}>
              <TableCell className="whitespace-nowrap">
                {getStatusBadge(product.status, product.stock)}
              </TableCell>
              <TableCell className="font-medium whitespace-nowrap">{product.article}</TableCell>
              <TableCell className="max-w-[200px] truncate">{product.name}</TableCell>
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
              <TableCell className="whitespace-nowrap">{product.stock} {product.unit}</TableCell>
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
              <TableCell>
                <Badge variant="outline" className="whitespace-nowrap">{product.category}</Badge>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}