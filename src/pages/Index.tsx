import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Package, TrendingUp, AlertTriangle, Activity, Plus, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useProductStore } from "@/lib/productStore";
import { useWarehouseStore } from "@/lib/warehouseStore";
import { PerformanceCard } from "@/components/PerformanceCard";
import { useMemo } from "react";

const Index = () => {
  const { products } = useProductStore();
  const { warehouses } = useWarehouseStore();
  
  // Calculate real statistics with memoization
  const statistics = useMemo(() => {
    const totalProducts = products.length;
    const totalWarehouses = warehouses.length;
    const lowStockProducts = products.filter(p => p.stock < 50 && p.stock > 0).length;
    const outOfStockProducts = products.filter(p => p.stock === 0).length;
    const totalStock = products.reduce((sum, p) => sum + p.stock, 0);
    
    return {
      totalProducts,
      totalWarehouses,
      lowStockProducts,
      outOfStockProducts,
      totalStock
    };
  }, [products, warehouses]);
  
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
        <PerformanceCard
          title="Ümumi Partiya"
          value={statistics.totalProducts}
          description={`${statistics.totalWarehouses} anbarda bölünən`}
          icon={<Package className="h-4 w-4 text-muted-foreground" />}
        />

        <PerformanceCard
          title="İşarələnmiş" 
          value={statistics.totalStock}
          description="Ümumi stok miqdarı"
          icon={<TrendingUp className="h-4 w-4 text-muted-foreground" />}
        />

        <PerformanceCard
          title="Az Qalan"
          value={statistics.lowStockProducts}
          description="Diqqət tələb edir"
          icon={<AlertTriangle className="h-4 w-4 text-warning" />}
          className="text-warning"
        />

        <PerformanceCard
          title="Bu Həftə"
          value={statistics.outOfStockProducts}
          description="Bitmiş məhsul"
          icon={<Activity className="h-4 w-4 text-muted-foreground" />}
        />
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
