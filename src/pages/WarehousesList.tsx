import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Search, Warehouse, Package, MapPin, Plus } from "lucide-react";
import { useProductStore } from "@/lib/productStore";
import { useWarehouseStore } from "@/lib/warehouseStore";
import { useParams, useNavigate } from "react-router-dom";

export default function WarehousesList() {
  const { warehouse: selectedWarehouse } = useParams();
  const navigate = useNavigate();
  const { products } = useProductStore();
  const { warehouses, addWarehouse } = useWarehouseStore();
  const [searchTerm, setSearchTerm] = useState("");
  const [newWarehouseName, setNewWarehouseName] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);

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
      const warehouseId = `warehouse-${Date.now()}`;
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
          <h1 className="text-3xl font-bold tracking-tight">
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          {allWarehouses.map(warehouse => {
            const warehouseProducts = products.filter(p => p.warehouses?.includes(warehouse));
            const totalStock = warehouseProducts.reduce((sum, p) => sum + p.stock, 0);
            
            return (
              <Card 
                key={warehouse} 
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => navigate(`/warehouses/${encodeURIComponent(warehouse)}`)}
              >
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Warehouse className="h-5 w-5 text-primary" />
                    {warehouse}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Məhsul növü:</span>
                      <span className="font-medium">{warehouseProducts.length}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Paket:</span>
                      <span className="font-medium">{warehouseProducts.reduce((total, product) => total + product.packaging.length, 0)}</span>
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

      {filteredData.map(warehouse => (
        <Card key={warehouse.name}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Warehouse className="h-5 w-5" />
              {warehouse.name} ({warehouse.products.length} məhsul, {warehouse.products.reduce((total, product) => total + product.packaging.length, 0)} paket)
            </CardTitle>
          </CardHeader>
          <CardContent>
            {warehouse.products.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Bu anbarda {searchTerm ? 'axtarış şərtinə uyğun' : ''} məhsul tapılmadı</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Vəziyyət</TableHead>
                    <TableHead>Artikul</TableHead>
                    <TableHead>Məhsul Adı</TableHead>
                    <TableHead>Paket</TableHead>
                    <TableHead>Stok</TableHead>
                    <TableHead>Digər Anbarlar</TableHead>
                    <TableHead>Kateqoriya</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {warehouse.products.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell>
                        {getStatusBadge(product.status, product.stock)}
                      </TableCell>
                      <TableCell className="font-medium">{product.article}</TableCell>
                      <TableCell>{product.name}</TableCell>
                      <TableCell>
                        <div className="flex gap-1 flex-wrap max-w-[120px]">
                          {product.packaging.length > 0 ? (
                            product.packaging.map((pack) => (
                              <Badge 
                                key={`${product.id}-pack-${pack.type}`} 
                                variant="outline" 
                                className="text-xs bg-accent/50"
                              >
                                {pack.type}×{pack.quantity}
                              </Badge>
                            ))
                          ) : (
                            <span className="text-muted-foreground text-xs">Yoxdur</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{product.stock} {product.unit}</TableCell>
                      <TableCell>
                        <div className="flex gap-1 flex-wrap">
                          {product.warehouses
                            ?.filter(w => w !== warehouse.name)
                            .map((otherWarehouse, index) => (
                              <Badge 
                                key={`${product.id}-other-warehouse-${otherWarehouse}-${index}`} 
                                variant="secondary" 
                                className="text-xs cursor-pointer hover:bg-secondary/80"
                                onClick={() => navigate(`/warehouses/${encodeURIComponent(otherWarehouse)}`)}
                              >
                                {otherWarehouse}
                              </Badge>
                            ))}
                          {(product.warehouses?.filter(w => w !== warehouse.name).length || 0) === 0 && (
                            <span className="text-muted-foreground text-sm">Yalnız bu anbarda</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{product.category}</Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}