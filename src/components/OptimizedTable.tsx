import { memo, useMemo } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

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

interface OptimizedTableProps {
  products: Product[];
  searchTerm?: string;
  onProductClick?: (product: Product) => void;
}

const ProductRow = memo(({ product, onProductClick }: { 
  product: Product; 
  onProductClick?: (product: Product) => void 
}) => {
  const getStatusBadge = (status: string, stock: number) => {
    if (status === "out_of_stock" || stock === 0) {
      return <Badge variant="destructive">Bitib</Badge>;
    }
    if (status === "low_stock" || stock < 50) {
      return <Badge variant="secondary" className="bg-warning text-warning-foreground">Az qalıb</Badge>;
    }
    return <Badge variant="secondary" className="bg-success text-success-foreground">Mövcud</Badge>;
  };

  return (
    <TableRow 
      key={product.id}
      className={onProductClick ? "cursor-pointer hover:bg-muted/50" : ""}
      onClick={() => onProductClick?.(product)}
    >
      <TableCell className="font-medium">{product.article}</TableCell>
      <TableCell>{product.name}</TableCell>
      <TableCell>
        <Badge variant="outline">{product.category}</Badge>
      </TableCell>
      <TableCell>{product.stock} {product.unit}</TableCell>
      <TableCell>
        {getStatusBadge(product.status, product.stock)}
      </TableCell>
      <TableCell>
        <div className="flex gap-1 flex-wrap">
           {product.warehouses.map((warehouse, index) => (
            <Badge key={`${product.id}-warehouse-${warehouse}-${index}`} variant="secondary" className="text-xs">
              {warehouse}
            </Badge>
          ))}
        </div>
      </TableCell>
      <TableCell>
        <div className="flex gap-1 flex-wrap">
           {product.packaging.slice(0, 3).map((pkg, index) => (
            <Badge key={`${product.id}-packaging-${pkg}-${index}`} variant="outline" className="text-xs">
              {pkg}
            </Badge>
          ))}
          {product.packaging.length > 3 && (
            <Badge variant="outline" className="text-xs">
              +{product.packaging.length - 3}
            </Badge>
          )}
        </div>
      </TableCell>
    </TableRow>
  );
});

ProductRow.displayName = "ProductRow";

export const OptimizedTable = memo(({ 
  products, 
  searchTerm = "", 
  onProductClick 
}: OptimizedTableProps) => {
  const filteredProducts = useMemo(() => {
    if (!searchTerm) return products;
    
    const lowerSearchTerm = searchTerm.toLowerCase();
    return products.filter(product => 
      product.name.toLowerCase().includes(lowerSearchTerm) ||
      product.article.toLowerCase().includes(lowerSearchTerm) ||
      product.category.toLowerCase().includes(lowerSearchTerm)
    );
  }, [products, searchTerm]);

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="min-w-[100px]">Artikul</TableHead>
          <TableHead className="min-w-[200px]">Məhsul Adı</TableHead>
          <TableHead className="min-w-[120px]">Kateqoriya</TableHead>
          <TableHead className="min-w-[100px]">Stok</TableHead>
          <TableHead className="min-w-[100px]">Vəziyyət</TableHead>
          <TableHead className="min-w-[150px]">Anbarlar</TableHead>
          <TableHead className="min-w-[150px]">Paketləşdirmə</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {filteredProducts.length === 0 ? (
          <TableRow>
            <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
              {searchTerm ? "Axtarış şərtinə uyğun məhsul tapılmadı" : "Məhsul tapılmadı"}
            </TableCell>
          </TableRow>
        ) : (
          filteredProducts.map((product) => (
            <ProductRow 
              key={product.id} 
              product={product} 
              onProductClick={onProductClick}
            />
          ))
        )}
      </TableBody>
    </Table>
  );
});

OptimizedTable.displayName = "OptimizedTable";