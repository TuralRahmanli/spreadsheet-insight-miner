import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Download, TrendingUp, Package, AlertTriangle } from "lucide-react";
import { useProductStore } from "@/lib/productStore";

export default function Reports() {
  const { products } = useProductStore();
  
  // Calculate real statistics
  const totalProducts = products.length;
  const activeProducts = products.filter(p => p.status === 'active').length;
  const lowStockProducts = products.filter(p => p.stock < 50 && p.stock > 0).length;
  const outOfStockProducts = products.filter(p => p.stock === 0).length;
  const totalStock = products.reduce((sum, p) => sum + p.stock, 0);
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Hesabatlar</h1>
        <div className="flex gap-2">
          <Button variant="outline">
            <Calendar className="mr-2 h-4 w-4" />
            Tarix seç
          </Button>
          <Button>
            <Download className="mr-2 h-4 w-4" />
            İxrac et
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ümumi Məhsul</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalProducts}</div>
            <p className="text-xs text-muted-foreground">
              Fərqli məhsul növü
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">İşarələnmiş</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeProducts}</div>
            <p className="text-xs text-muted-foreground">
              Aktiv məhsullar
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
            <CardTitle className="text-sm font-medium">Qalan</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalStock}</div>
            <p className="text-xs text-muted-foreground">
              Anbarda qalan məhsul
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Məhsul Statusu</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span>Aktiv</span>
                <span className="font-medium">{activeProducts} ədəd</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div 
                  className="bg-success h-2 rounded-full" 
                  style={{ width: `${totalProducts > 0 ? (activeProducts / totalProducts) * 100 : 0}%` }}
                ></div>
              </div>
              
              <div className="flex items-center justify-between">
                <span>Az qalan</span>
                <span className="font-medium">{lowStockProducts} ədəd</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div 
                  className="bg-warning h-2 rounded-full" 
                  style={{ width: `${totalProducts > 0 ? (lowStockProducts / totalProducts) * 100 : 0}%` }}
                ></div>
              </div>
              
              <div className="flex items-center justify-between">
                <span>Bitib</span>
                <span className="font-medium">{outOfStockProducts} ədəd</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div 
                  className="bg-destructive h-2 rounded-full" 
                  style={{ width: `${totalProducts > 0 ? (outOfStockProducts / totalProducts) * 100 : 0}%` }}
                ></div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Son Əməliyyatlar</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between py-2 border-b">
                <div>
                  <p className="font-medium">Albalı 3 - Çıxarıldı</p>
                  <p className="text-sm text-muted-foreground">Bugün, 14:30</p>
                </div>
                <span className="text-success font-medium">✓ 25 ədəd</span>
              </div>
              
              <div className="flex items-center justify-between py-2 border-b">
                <div>
                  <p className="font-medium">Mango 2 - Çıxarıldı</p>
                  <p className="text-sm text-muted-foreground">Bugün, 11:15</p>
                </div>
                <span className="text-success font-medium">✓ 12 ədəd</span>
              </div>
              
              <div className="flex items-center justify-between py-2 border-b">
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
}