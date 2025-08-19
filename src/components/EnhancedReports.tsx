import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Package, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  Warehouse,
  Calendar,
  BarChart3,
  PieChart
} from "lucide-react";
import { useProductStore } from "@/lib/productStore";
import { useWarehouseStore } from "@/lib/warehouseStore";
import { useOperationHistory } from "@/hooks/useOperationHistory";

export function EnhancedReports() {
  const { products } = useProductStore();
  const { warehouses } = useWarehouseStore();
  const { operations } = useOperationHistory();

  const analytics = useMemo(() => {
    // Basic metrics
    const totalProducts = products.length;
    const activeProducts = products.filter(p => p.status === 'active').length;
    const lowStockProducts = products.filter(p => p.stock < 50 && p.stock > 0).length;
    const outOfStockProducts = products.filter(p => p.stock === 0).length;
    const totalStock = products.reduce((sum, p) => sum + p.stock, 0);

    // Category distribution
    const categoryStats = products.reduce((acc, product) => {
      acc[product.category] = (acc[product.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Warehouse utilization
    const warehouseStats = warehouses.map(warehouse => {
      const warehouseProducts = products.filter(p => 
        p.warehouses?.includes(warehouse.name)
      );
      const warehouseStock = warehouseProducts.reduce((sum, p) => sum + p.stock, 0);
      
      return {
        name: warehouse.name,
        productCount: warehouseProducts.length,
        totalStock: warehouseStock,
        utilization: Math.min(100, (warehouseStock / 1000) * 100) // Assuming 1000 is max capacity
      };
    });

    // Recent operations analysis
    const recentOperations = operations.slice(0, 10);
    const operationTypes = recentOperations.reduce((acc, op) => {
      acc[op.type] = (acc[op.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Stock movement trends
    const stockMovements = {
      incoming: recentOperations.filter(op => op.type === 'daxil').length,
      outgoing: recentOperations.filter(op => ['xaric', 'satış'].includes(op.type)).length,
      transfers: recentOperations.filter(op => op.type === 'transfer').length
    };

    return {
      totalProducts,
      activeProducts,
      lowStockProducts,
      outOfStockProducts,
      totalStock,
      categoryStats,
      warehouseStats,
      operationTypes,
      stockMovements,
      recentOperations
    };
  }, [products, warehouses, operations]);

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ümumi Məhsul</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.totalProducts}</div>
            <p className="text-xs text-muted-foreground">
              {analytics.activeProducts} aktiv
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ümumi Stok</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.totalStock}</div>
            <p className="text-xs text-muted-foreground">
              Bütün anbarlarda
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Az Qalan</CardTitle>
            <AlertTriangle className="h-4 w-4 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-warning">{analytics.lowStockProducts}</div>
            <p className="text-xs text-muted-foreground">
              Diqqət tələb edir
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Bitmiş</CardTitle>
            <TrendingDown className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{analytics.outOfStockProducts}</div>
            <p className="text-xs text-muted-foreground">
              Təcili tədarük lazım
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Category Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="h-5 w-5" />
              Kateqoriya Paylanması
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(analytics.categoryStats).map(([category, count]) => {
                const percentage = (count / analytics.totalProducts) * 100;
                return (
                  <div key={category} className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{category}</span>
                      <span className="text-sm text-muted-foreground">{count} məhsul</span>
                    </div>
                    <Progress value={percentage} className="h-2" />
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Warehouse Utilization */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Warehouse className="h-5 w-5" />
              Anbar İstifadəsi
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analytics.warehouseStats.map((warehouse) => (
                <div key={warehouse.name} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{warehouse.name}</span>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        {warehouse.productCount} məhsul
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        {warehouse.totalStock} ədəd
                      </span>
                    </div>
                  </div>
                  <Progress value={warehouse.utilization} className="h-2" />
                  <p className="text-xs text-muted-foreground">
                    İstifadə: {warehouse.utilization.toFixed(1)}%
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Stock Movements */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Stok Hərəkətləri
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="text-center">
              <div className="text-2xl font-bold text-success">{analytics.stockMovements.incoming}</div>
              <p className="text-sm text-muted-foreground">Daxil olan</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-destructive">{analytics.stockMovements.outgoing}</div>
              <p className="text-sm text-muted-foreground">Çıxan</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-info">{analytics.stockMovements.transfers}</div>
              <p className="text-sm text-muted-foreground">Transfer</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Operation Types Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Əməliyyat Növləri
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Object.entries(analytics.operationTypes).map(([type, count]) => {
              const percentage = (count / analytics.recentOperations.length) * 100;
              return (
                <div key={type} className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium capitalize">{type}</span>
                    <span className="text-sm text-muted-foreground">{count} dəfə</span>
                  </div>
                  <Progress value={percentage} className="h-2" />
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}