import { useState, useMemo, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Plus, Filter, X, Upload } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useProductStore } from "@/lib/productStore";
import { useWarehouseStockStore } from "@/lib/warehouseStockStore";
import { Product } from "@/types";
import { ProductTable } from "../components/ProductTable";
import { ProductDialog } from "../components/ProductDialog";
import { ProductFilters } from "../components/ProductFilters";
import { ExcelImport } from "../components/ExcelImport";
import { MobileProductCard } from "../components/MobileProductCard";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

interface Filters {
  status: string;
  stockLevel: string;
  unit: string;
  category: string;
}

const getStatusBadge = (status: string, stock: number) => {
  if (status === "out_of_stock" || stock === 0) {
    return <Badge variant="destructive" className="bg-destructive/90 text-destructive-foreground">Bitib</Badge>;
  }
  if (status === "low_stock" || stock < 50) {
    return <Badge variant="secondary" className="bg-warning/90 text-warning-foreground">Az qalıb</Badge>;
  }
  return <Badge variant="secondary" className="bg-success/90 text-success-foreground">Mövcud</Badge>;
};

export default function ProductsList() {
  const navigate = useNavigate();
  const { products } = useProductStore();
  const { initializeFromProducts } = useWarehouseStockStore();
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState<Filters>({
    status: "all",
    stockLevel: "all",
    unit: "all",
    category: "all"
  });
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null);
  const { toast } = useToast();
  
  const categories = ["all", ...Array.from(new Set(products.map(p => p.category)))];
  
  // Initialize warehouse stock from products on first load
  useEffect(() => {
    if (products.length > 0) {
      initializeFromProducts(products);
    }
  }, [products, initializeFromProducts]);
  
  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           product.article.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = filters.category === "all" || product.category === filters.category;
      
      const matchesStatus = filters.status === "all" || 
        (filters.status === "active" && product.status === "active") ||
        (filters.status === "out_of_stock" && (product.status === "out_of_stock" || product.stock === 0)) ||
        (filters.status === "low_stock" && (product.status === "low_stock" || (product.stock > 0 && product.stock < 50)));
      
      const matchesStockLevel = filters.stockLevel === "all" ||
        (filters.stockLevel === "in_stock" && product.stock >= 50) ||
        (filters.stockLevel === "low_stock" && product.stock > 0 && product.stock < 50) ||
        (filters.stockLevel === "out_of_stock" && product.stock === 0);
      
      const matchesUnit = filters.unit === "all" || product.unit === filters.unit;
      
      return matchesSearch && matchesCategory && matchesStatus && matchesStockLevel && matchesUnit;
    });
  }, [products, searchTerm, filters]);

  const clearAllFilters = () => {
    setFilters({
      status: "all",
      stockLevel: "all", 
      unit: "all",
      category: "all"
    });
    setSearchTerm("");
  };

  const hasActiveFilters = filters.status !== "all" || filters.stockLevel !== "all" || 
                          filters.unit !== "all" || filters.category !== "all" || searchTerm !== "";

  const handleDeleteProduct = (productId: string) => {
    const { removeProduct } = useProductStore.getState();
    removeProduct(productId);
    toast({
      title: "Uğur",
      description: "Məhsul uğurla silindi"
    });
  };

  const handleEditProduct = (product: Product) => {
    setIsDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="space-y-3 md:space-y-0 md:flex md:items-center md:justify-between">
            <div className="flex items-center gap-2">
              <span className="text-lg md:text-xl">Məhsullar Siyahısı</span>
              <Badge variant="outline">{filteredProducts.length}</Badge>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsFiltersOpen(!isFiltersOpen)}
                className="flex items-center gap-1 text-xs md:text-sm"
              >
                <Filter className="h-3 w-3 md:h-4 md:w-4" />
                <span className="hidden sm:inline">Filtrlər</span>
                <span className="sm:hidden">Filtr</span>
                {hasActiveFilters && (
                  <Badge variant="secondary" className="ml-1 h-4 w-4 md:h-5 md:w-5 rounded-full p-0 text-xs">
                    !
                  </Badge>
                )}
              </Button>

              <ExcelImport />

              <ProductDialog 
                isOpen={isDialogOpen}
                onOpenChange={setIsDialogOpen}
                trigger={
                  <Button className="flex items-center gap-1 text-xs md:text-sm">
                    <Plus className="h-3 w-3 md:h-4 md:w-4" />
                    <span className="hidden sm:inline">Yeni Məhsul</span>
                    <span className="sm:hidden">Yeni</span>
                  </Button>
                }
              />
            </div>
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Məhsul adı və ya artikul ilə axtarış..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Filters */}
          {isFiltersOpen && (
            <ProductFilters
              filters={filters}
              onFiltersChange={setFilters}
              categories={categories}
              products={products}
              hasActiveFilters={hasActiveFilters}
              onClearFilters={clearAllFilters}
            />
          )}

          {/* Products Table - Desktop */}
          <div className="hidden md:block">
            <ProductTable 
              products={filteredProducts}
              searchTerm={searchTerm}
              hasActiveFilters={hasActiveFilters}
              getStatusBadge={getStatusBadge}
            />
          </div>

          {/* Products Cards - Mobile */}
          <div className="md:hidden space-y-3">
            {filteredProducts.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                {searchTerm || hasActiveFilters 
                  ? "Axtarış şərtinə uyğun məhsul tapılmadı" 
                  : "Məhsul tapılmadı"
                }
              </div>
            ) : (
              filteredProducts.map((product) => (
                <div key={product.id}>
                  <MobileProductCard
                    product={product}
                    getStatusBadge={getStatusBadge}
                    onEdit={handleEditProduct}
                    onDelete={(productId) => setDeletingProduct(product)}
                  />
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog - Mobile */}
      {deletingProduct && (
        <AlertDialog open={!!deletingProduct} onOpenChange={() => setDeletingProduct(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Məhsulu sil</AlertDialogTitle>
              <AlertDialogDescription>
                Bu məhsulu silmək istədiyinizə əminsiniz? Bu əməliyyat geri alına bilməz.
                <br /><br />
                <strong>Məhsul:</strong> {deletingProduct.name} ({deletingProduct.article})
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setDeletingProduct(null)}>
                Ləğv et
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={() => {
                  handleDeleteProduct(deletingProduct.id);
                  setDeletingProduct(null);
                }}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Sil
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  );
}