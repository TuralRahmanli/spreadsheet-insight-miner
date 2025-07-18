import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Search, Plus, Edit, Trash2, CheckCircle } from "lucide-react";

const warehouses = [
  {
    name: "Albalı Anbarı",
    batches: Array.from({ length: 9 }, (_, i) => ({
      id: `albali-${i + 1}`,
      name: `Albalı ${i + 1}`,
      batchNumber: i + 1,
      quantity: Math.floor(Math.random() * 100),
      checked: Math.random() > 0.7,
      status: Math.random() > 0.3 ? "available" : "low",
    })),
  },
  {
    name: "Qarağat Anbarı",
    batches: Array.from({ length: 4 }, (_, i) => ({
      id: `qaragat-${i + 1}`,
      name: `Qarağat ${i + 1}`,
      batchNumber: i + 1,
      quantity: Math.floor(Math.random() * 100),
      checked: Math.random() > 0.7,
      status: Math.random() > 0.3 ? "available" : "low",
    })),
  },
  {
    name: "Mango Anbarı",
    batches: Array.from({ length: 5 }, (_, i) => ({
      id: `mango-${i + 1}`,
      name: `Mango ${i + 1}`,
      batchNumber: i + 1,
      quantity: Math.floor(Math.random() * 100),
      checked: Math.random() > 0.7,
      status: Math.random() > 0.3 ? "available" : "low",
    })),
  },
  {
    name: "Zeytun Anbarı",
    batches: [
      {
        id: "zeytun-1",
        name: "Zeytun 1",
        batchNumber: 1,
        quantity: Math.floor(Math.random() * 100),
        checked: Math.random() > 0.7,
        status: Math.random() > 0.3 ? "available" : "low",
      },
    ],
  },
];

const getStatusColor = (status: string, checked: boolean) => {
  if (checked) {
    return "bg-success text-success-foreground";
  }
  switch (status) {
    case "available":
      return "bg-info text-info-foreground";
    case "low":
      return "bg-warning text-warning-foreground";
    default:
      return "bg-muted text-muted-foreground";
  }
};

export default function Products() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Anbar İdarəetməsi</h1>
          <p className="text-muted-foreground">Anbarlar və partiyaların idarə edilməsi</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <CheckCircle className="mr-2 h-4 w-4" />
            İşarələnmiş: 47
          </Button>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Yeni Partiya
          </Button>
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <Search className="h-4 w-4 text-muted-foreground" />
        <Input placeholder="Anbar və ya partiya axtar..." className="max-w-sm" />
      </div>

      <div className="grid gap-6">
        {warehouses.map((warehouse) => {
          const totalBatches = warehouse.batches.length;
          const checkedBatches = warehouse.batches.filter(batch => batch.checked).length;
          const availableBatches = warehouse.batches.filter(batch => !batch.checked && batch.status === "available").length;
          const lowStockBatches = warehouse.batches.filter(batch => !batch.checked && batch.status === "low").length;

          return (
            <Card key={warehouse.name}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl">{warehouse.name}</CardTitle>
                  <div className="flex gap-2 text-sm text-muted-foreground">
                    <span>Ümumi: {totalBatches}</span>
                    <span>•</span>
                    <span className="text-success">Çıxarıldı: {checkedBatches}</span>
                    <span>•</span>
                    <span className="text-info">Mövcud: {availableBatches}</span>
                    <span>•</span>
                    <span className="text-warning">Az: {lowStockBatches}</span>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                  {warehouse.batches.map((batch) => (
                    <div
                      key={batch.id}
                      className={`flex items-center justify-between rounded-lg border p-3 hover:bg-muted/50 ${
                        batch.checked ? "bg-success/10" : ""
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Checkbox
                          checked={batch.checked}
                          className="h-5 w-5"
                        />
                        <div className="space-y-1">
                          <p className={`font-medium ${batch.checked ? "line-through text-muted-foreground" : ""}`}>
                            {batch.name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Partiya #{batch.batchNumber} • {batch.quantity} ədəd
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={getStatusColor(batch.status, batch.checked)} variant="secondary">
                          {batch.checked ? "Çıxarıldı" : batch.status === "available" ? "Mövcud" : "Az"}
                        </Badge>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="icon">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}