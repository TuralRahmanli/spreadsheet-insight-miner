import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, Warehouse, Package, MapPin } from "lucide-react";
import { useProductStore } from "@/lib/productStore";
import { useWarehouseStore } from "@/lib/warehouseStore";
import { useParams, useNavigate } from "react-router-dom";

export default function WarehousesList() {
  const { warehouse: selectedWarehouse } = useParams();
  const navigate = useNavigate();
  const { products } = useProductStore();
  const { warehouses } = useWarehouseStore();
  const [searchTerm, setSearchTerm] = useState("");

  // Get warehouses from warehouse store
  const allWarehouses = warehouses.map(w => w.name).sort();
  
  // Filter products by selected warehouse or show all warehouses
  const filteredData = selectedWarehouse 
    ? [{
        name: selectedWarehouse,
        products: products.filter(p => 
          p.warehouses.includes(selectedWarehouse) &&
          (p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
           p.article.toLowerCase().includes(searchTerm.toLowerCase()))
        )
      }]
    : allWarehouses.map(warehouse => ({
        name: warehouse,
        products: products.filter(p => 
          p.warehouses.includes(warehouse) &&
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
        {selectedWarehouse && (
          <Button variant="outline" onClick={() => navigate('/warehouses')}>
            <MapPin className="mr-2 h-4 w-4" />
            Bütün Anbarlara Qayıt
          </Button>
        )}
      </div>

      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2 flex-1">
          <Search className="h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Məhsul adı və ya artikul axtar..." 
            className="max-w-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {!selectedWarehouse && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          {allWarehouses.map(warehouse => {
            const warehouseProducts = products.filter(p => p.warehouses.includes(warehouse));
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
              {warehouse.name} ({warehouse.products.length} məhsul)
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
                    <TableHead>Artikul</TableHead>
                    <TableHead>Məhsul Adı</TableHead>
                    <TableHead>Kateqoriya</TableHead>
                    <TableHead>Stok</TableHead>
                    <TableHead>Vəziyyət</TableHead>
                    <TableHead>Digər Anbarlar</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {warehouse.products.map((product) => (
                    <TableRow key={product.id}>
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
                          {product.warehouses
                            .filter(w => w !== warehouse.name)
                            .map((otherWarehouse, index) => (
                              <Badge 
                                key={index} 
                                variant="secondary" 
                                className="text-xs cursor-pointer hover:bg-secondary/80"
                                onClick={() => navigate(`/warehouses/${encodeURIComponent(otherWarehouse)}`)}
                              >
                                {otherWarehouse}
                              </Badge>
                            ))}
                          {product.warehouses.filter(w => w !== warehouse.name).length === 0 && (
                            <span className="text-muted-foreground text-sm">Yalnız bu anbarda</span>
                          )}
                        </div>
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