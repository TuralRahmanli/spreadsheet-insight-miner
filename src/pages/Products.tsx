import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Plus, Edit, Trash2 } from "lucide-react";

const productCategories = [
  {
    name: "Albalı",
    items: Array.from({ length: 9 }, (_, i) => ({
      id: `albali-${i + 1}`,
      name: `Albalı ${i + 1}`,
      quantity: Math.floor(Math.random() * 100),
      status: Math.random() > 0.3 ? "available" : "low",
    })),
  },
  {
    name: "Qarağat",
    items: Array.from({ length: 4 }, (_, i) => ({
      id: `qaragat-${i + 1}`,
      name: `Qarağat ${i + 1}`,
      quantity: Math.floor(Math.random() * 100),
      status: Math.random() > 0.3 ? "available" : "low",
    })),
  },
  {
    name: "Mango",
    items: Array.from({ length: 5 }, (_, i) => ({
      id: `mango-${i + 1}`,
      name: `Mango ${i + 1}`,
      quantity: Math.floor(Math.random() * 100),
      status: Math.random() > 0.3 ? "available" : "low",
    })),
  },
  {
    name: "Zeytun",
    items: [
      {
        id: "zeytun-1",
        name: "Zeytun 1",
        quantity: Math.floor(Math.random() * 100),
        status: Math.random() > 0.3 ? "available" : "low",
      },
    ],
  },
];

const getStatusColor = (status: string) => {
  switch (status) {
    case "available":
      return "bg-success text-success-foreground";
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
        <h1 className="text-3xl font-bold tracking-tight">Məhsullar</h1>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Yeni Məhsul
        </Button>
      </div>

      <div className="flex items-center space-x-2">
        <Search className="h-4 w-4 text-muted-foreground" />
        <Input placeholder="Məhsul axtar..." className="max-w-sm" />
      </div>

      <div className="grid gap-6">
        {productCategories.map((category) => (
          <Card key={category.name}>
            <CardHeader>
              <CardTitle className="text-xl">{category.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                {category.items.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between rounded-lg border p-3 hover:bg-muted/50"
                  >
                    <div className="space-y-1">
                      <p className="font-medium">{item.name}</p>
                      <p className="text-sm text-muted-foreground">
                        Miqdar: {item.quantity}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={getStatusColor(item.status)}>
                        {item.status === "available" ? "Mövcud" : "Az"}
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
        ))}
      </div>
    </div>
  );
}