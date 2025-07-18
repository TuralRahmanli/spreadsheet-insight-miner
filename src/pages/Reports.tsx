import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Download, TrendingUp, Package, AlertTriangle } from "lucide-react";

export default function Reports() {
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
            <div className="text-2xl font-bold">19</div>
            <p className="text-xs text-muted-foreground">
              Fərqli məhsul növü
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ümumi Miqdar</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,247</div>
            <p className="text-xs text-muted-foreground">
              Anbar məhsulları
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Az Qalan</CardTitle>
            <AlertTriangle className="h-4 w-4 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-warning">4</div>
            <p className="text-xs text-muted-foreground">
              Diqqət tələb edir
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Kateqoriya</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">4</div>
            <p className="text-xs text-muted-foreground">
              Albalı, Qarağat, Mango, Zeytun
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Kateqoriya üzrə Paylanma</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span>Albalı</span>
                <span className="font-medium">47%</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div className="bg-primary h-2 rounded-full" style={{ width: "47%" }}></div>
              </div>
              
              <div className="flex items-center justify-between">
                <span>Mango</span>
                <span className="font-medium">26%</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div className="bg-success h-2 rounded-full" style={{ width: "26%" }}></div>
              </div>
              
              <div className="flex items-center justify-between">
                <span>Qarağat</span>
                <span className="font-medium">21%</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div className="bg-info h-2 rounded-full" style={{ width: "21%" }}></div>
              </div>
              
              <div className="flex items-center justify-between">
                <span>Zeytun</span>
                <span className="font-medium">6%</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div className="bg-warning h-2 rounded-full" style={{ width: "6%" }}></div>
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
                  <p className="font-medium">Albalı 3 - Daxil olma</p>
                  <p className="text-sm text-muted-foreground">Bugün, 14:30</p>
                </div>
                <span className="text-success font-medium">+25</span>
              </div>
              
              <div className="flex items-center justify-between py-2 border-b">
                <div>
                  <p className="font-medium">Mango 2 - Satış</p>
                  <p className="text-sm text-muted-foreground">Bugün, 11:15</p>
                </div>
                <span className="text-destructive font-medium">-12</span>
              </div>
              
              <div className="flex items-center justify-between py-2 border-b">
                <div>
                  <p className="font-medium">Qarağat 1 - Daxil olma</p>
                  <p className="text-sm text-muted-foreground">Dünən, 16:45</p>
                </div>
                <span className="text-success font-medium">+40</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}