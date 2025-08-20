import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Search, Warehouse, Package, Plus, ChevronDown, ChevronUp } from "lucide-react";
import { useProductStore } from "@/lib/productStore";
import { useWarehouseStore } from "@/lib/warehouseStore";
import { usePackagingMethodsStore } from "@/lib/packagingMethodsStore";
import { useOperationHistory } from "@/hooks/useOperationHistory";
import { useParams, useNavigate } from "react-router-dom";
import { WarehouseResponsiveTable } from "@/components/WarehouseResponsiveTable";
import { useIsMobile } from "@/hooks/use-mobile";

export default function WarehousesList() {
  const { warehouse: selectedWarehouse } = useParams();
  const navigate = useNavigate();
  const { products } = useProductStore();
  const { warehouses, addWarehouse } = useWarehouseStore();
  const { packagingMethods } = usePackagingMethodsStore();
  const { operations } = useOperationHistory();
  const [searchTerm, setSearchTerm] = useState("");
  const [newWarehouseName, setNewWarehouseName] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [expandedWarehouses, setExpandedWarehouses] = useState<Set<string>>(new Set());
  const isMobile = useIsMobile();

  const toggleWarehouse = (warehouseName: string) => {
    const newExpanded = new Set(expandedWarehouses);
    if (newExpanded.has(warehouseName)) {
      newExpanded.delete(warehouseName);
    } else {
      newExpanded.add(warehouseName);
    }
    setExpandedWarehouses(newExpanded);
  };

  // Get packaging methods summary from products
  const getPackagingSummary = (products: any[]) => {
    const methodCounts: { [key: string]: number } = {};
    
    products.forEach(product => {
      if (product.packaging && Array.isArray(product.packaging)) {
        product.packaging.forEach((pkg: any) => {
          // Use pkg.type instead of pkg.method and map to packaging method names
          const method = pkg.type === "Rulon" ? "Rulon" : "Paket";
          // Use the quantity field directly from packaging data
          const packageCount = pkg.quantity || 0;
          methodCounts[method] = (methodCounts[method] || 0) + packageCount;
        });
      }
    });

    const entries = Object.entries(methodCounts).filter(([_, count]) => count > 0);
    
    if (entries.length === 0) return "Paket";
    if (entries.length === 1) {
      const [method, count] = entries[0];
      return `${count} ${method}`;
    }
    
    return entries.map(([method, count]) => `${count} ${method}`).join(" + ");
  };

  // Get warehouses from warehouse store
  const allWarehouses = warehouses.map(w => w.name).sort();
  
  // Filter products by selected warehouse or show all warehouses
  const filteredData = selectedWarehouse 
    ? [{
        name: selectedWarehouse,
        products: products.filter(p => 
          p.warehouses?.includes(selectedWarehouse) &&
          (p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
           p.article.toLowerCase().includes(searchTerm.toLowerCase()))
        )
      }]
    : allWarehouses.map(warehouse => ({
        name: warehouse,
        products: products.filter(p => 
          p.warehouses?.includes(warehouse) &&
          (p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
           p.article.toLowerCase().includes(searchTerm.toLowerCase()))
        )
      })).filter(w => w.products.length > 0 || !searchTerm);

  const getStatusBadge = (status: string, stock: number) => {
    if (status === "out_of_stock" || stock === 0) {
      return <Badge variant="destructive">Bitib</Badge>;
    }
    if (status === "low_stock" || stock < 50) {
      return <Badge variant="secondary" className="bg-warning text-warning-foreground">Az qalıb</Badge>;
    }
    return <Badge variant="secondary" className="bg-success text-success-foreground">Mövcud</Badge>;
  };

  const handleAddWarehouse = () => {
    if (newWarehouseName.trim()) {
      const warehouseId = `warehouse-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      addWarehouse({
        id: warehouseId,
        name: newWarehouseName.trim()
      });
      setNewWarehouseName("");
      setIsDialogOpen(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl md:text-2xl lg:text-3xl font-bold tracking-tight">
            {selectedWarehouse ? `${selectedWarehouse} Anbarı` : "Anbarlar Siyahısı"}
          </h1>
          <p className="text-muted-foreground">
            {selectedWarehouse 
              ? `${selectedWarehouse} anbarında mövcud məhsullar`
              : "Bütün anbarlar və onlardakı məhsullar"
            }
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Yeni Anbar
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Yeni Anbar Əlavə Et</DialogTitle>
              <DialogDescription>
                Sistemə yeni anbar əlavə etmək üçün adını daxil edin.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="warehouse-name" className="text-right">
                  Anbar Adı
                </Label>
                <Input
                  id="warehouse-name"
                  value={newWarehouseName}
                  onChange={(e) => setNewWarehouseName(e.target.value)}
                  placeholder="Anbar adını daxil edin"
                  className="col-span-3"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleAddWarehouse();
                    }
                  }}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Ləğv Et
              </Button>
              <Button 
                onClick={handleAddWarehouse}
                disabled={!newWarehouseName.trim()}
              >
                Əlavə Et
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2 flex-1">
          <Search className="h-4 w-4 text-muted-foreground" />
          <Label htmlFor="search-input" className="sr-only">
            Məhsul axtarışı
          </Label>
          <Input 
            id="search-input"
            placeholder="Məhsul adı və ya artikul axtar..." 
            className="max-w-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {!selectedWarehouse && allWarehouses.length === 0 && (
        <Card>
          <CardContent className="py-8">
            <div className="text-center">
              <Warehouse className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-medium mb-2">Anbar tapılmadı</h3>
              <p className="text-muted-foreground mb-4">
                Sistemdə hələ heç bir anbar əlavə edilməyib. İlk anbarınızı əlavə edin.
              </p>
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    İlk Anbarı Əlavə Et
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>Yeni Anbar Əlavə Et</DialogTitle>
                    <DialogDescription>
                      Sistemə yeni anbar əlavə etmək üçün adını daxil edin.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="warehouse-name" className="text-right">
                        Anbar Adı
                      </Label>
                      <Input
                        id="warehouse-name"
                        value={newWarehouseName}
                        onChange={(e) => setNewWarehouseName(e.target.value)}
                        placeholder="Anbar adını daxil edin"
                        className="col-span-3"
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            handleAddWarehouse();
                          }
                        }}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                      Ləğv Et
                    </Button>
                    <Button 
                      onClick={handleAddWarehouse}
                      disabled={!newWarehouseName.trim()}
                    >
                      Əlavə Et
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </CardContent>
        </Card>
      )}

      {!selectedWarehouse && allWarehouses.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          {allWarehouses.map(warehouse => {
            const warehouseProducts = products.filter(p => p.warehouses?.includes(warehouse));
            const totalStock = warehouseProducts.reduce((sum, p) => sum + p.stock, 0);
            const packagingSummary = getPackagingSummary(warehouseProducts);
            
            return (
              <Card 
                key={warehouse} 
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => navigate(`/warehouses/${encodeURIComponent(warehouse)}`)}
              >
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                    <Warehouse className="h-4 w-4 sm:h-5 sm:w-5 text-primary flex-shrink-0" />
                    <span className="truncate">{warehouse}</span>
                  </CardTitle>
                  <div className="text-sm text-muted-foreground">
                    {warehouseProducts.length} məhsul, {packagingSummary}
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Məhsul növü:</span>
                      <span className="font-medium">{warehouseProducts.length}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Paketləşdirmə:</span>
                      <span className="font-medium">{packagingSummary}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Ümumi stok:</span>
                      <span className="font-medium">{totalStock}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {filteredData.map(warehouse => {
        const packagingSummary = getPackagingSummary(warehouse.products);
        const isExpanded = expandedWarehouses.has(warehouse.name);
        
        return (
          <Collapsible 
            key={warehouse.name} 
            open={isExpanded}
            onOpenChange={() => toggleWarehouse(warehouse.name)}
          >
            <Card>
              <CollapsibleTrigger asChild>
                <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-start sm:items-center flex-col sm:flex-row gap-2">
                      <div className="flex items-center gap-2">
                        <Warehouse className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
                        <span className="font-semibold">{warehouse.name}</span>
                      </div>
                      <div className="text-sm sm:text-base font-normal text-muted-foreground">
                        {warehouse.products.length} məhsul, {packagingSummary}
                      </div>
                    </div>
                    <div className="flex items-center">
                      {isExpanded ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </div>
                  </CardTitle>
                </CardHeader>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <CardContent className="pt-0">
                  <WarehouseResponsiveTable 
                    products={warehouse.products}
                    warehouseName={warehouse.name}
                    getStatusBadge={getStatusBadge}
                    dynamicPackagingLabel={packagingSummary}
                    searchTerm={searchTerm}
                  />
                </CardContent>
              </CollapsibleContent>
            </Card>
          </Collapsible>
        );
      })}
    </div>
  );
}