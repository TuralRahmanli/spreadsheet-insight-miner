import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Package, TrendingUp, AlertTriangle, Activity, Plus, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useProductStore } from "@/lib/productStore";
import { useWarehouseStore } from "@/lib/warehouseStore";

const Index = () => {
  const { products } = useProductStore();
  const { warehouses } = useWarehouseStore();
  
  // Calculate real statistics
  const totalProducts = products.length;
  const totalWarehouses = warehouses.length;
  const lowStockProducts = products.filter(p => p.stock < 50 && p.stock > 0).length;
  const outOfStockProducts = products.filter(p => p.stock === 0).length;
  const totalStock = products.reduce((sum, p) => sum + p.stock, 0);
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Anbar İdarəetmə Sistemi</h1>
          <p className="text-muted-foreground">Anbar partiyalarını izləyin və idarə edin</p>
        </div>
        <Button asChild className="w-full sm:w-auto">
          <Link to="/add">
            <Plus className="mr-2 h-4 w-4" />
            Yeni Əməliyyat
          </Link>
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ümumi Partiya</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalProducts}</div>
            <p className="text-xs text-muted-foreground">
              {totalWarehouses} anbarda bölünən
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">İşarələnmiş</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalStock}</div>
            <p className="text-xs text-muted-foreground">
              Ümumi stok miqdarı
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Az Qalan</CardTitle>
            <AlertTriangle className="h-4 w-4 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-warning">{lowStockProducts}</div>
            <p className="text-xs text-muted-foreground">
              Diqqət tələb edir
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Bu Həftə</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{outOfStockProducts}</div>
            <p className="text-xs text-muted-foreground">
              Bitmiş məhsul
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Tez Keçid</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button variant="outline" className="w-full justify-between" asChild>
              <Link to="/warehouses">
                Anbarları görüntülə
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button variant="outline" className="w-full justify-between" asChild>
              <Link to="/reports">
                Partiya hesabatları
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button variant="outline" className="w-full justify-between" asChild>
              <Link to="/templates">
                Şablonları idarə et
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Son Fəaliyyətlər</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between py-2">
                <div>
                  <p className="font-medium">Albalı 3 - Çıxarıldı</p>
                  <p className="text-sm text-muted-foreground">Bugün, 14:30</p>
                </div>
                <span className="text-success font-medium">✓ 25 ədəd</span>
              </div>
              
              <div className="flex items-center justify-between py-2">
                <div>
                  <p className="font-medium">Mango 2 - Çıxarıldı</p>
                  <p className="text-sm text-muted-foreground">Bugün, 11:15</p>
                </div>
                <span className="text-success font-medium">✓ 12 ədəd</span>
              </div>
              
              <div className="flex items-center justify-between py-2">
                <div>
                  <p className="font-medium">Qarağat 1 - Çıxarıldı</p>
                  <p className="text-sm text-muted-foreground">Dünən, 16:45</p>
                </div>
                <span className="text-success font-medium">✓ 40 ədəd</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Index;
