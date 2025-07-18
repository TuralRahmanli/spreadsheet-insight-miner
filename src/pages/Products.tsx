import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, Plus, Edit, Trash2, CheckCircle } from "lucide-react";

const warehouses = [
  {
    name: "Albalı Anbarı",
    batches: Array.from({ length: 9 }, (_, i) => ({
      id: `albali-${i + 1}`,
      name: `Albalı ${i + 1}`,
      batchNumber: i + 1,
      rolls: Array.from({ length: Math.floor(Math.random() * 20) + 10 }, (_, rollIndex) => ({
        id: `albali-${i + 1}-roll-${rollIndex + 1}`,
        rollNumber: rollIndex + 1,
        checked: Math.random() > 0.7,
      })),
      status: Math.random() > 0.3 ? "available" : "low",
    })),
  },
  {
    name: "Qarağat Anbarı",
    batches: Array.from({ length: 4 }, (_, i) => ({
      id: `qaragat-${i + 1}`,
      name: `Qarağat ${i + 1}`,
      batchNumber: i + 1,
      rolls: Array.from({ length: Math.floor(Math.random() * 15) + 8 }, (_, rollIndex) => ({
        id: `qaragat-${i + 1}-roll-${rollIndex + 1}`,
        rollNumber: rollIndex + 1,
        checked: Math.random() > 0.7,
      })),
      status: Math.random() > 0.3 ? "available" : "low",
    })),
  },
  {
    name: "Mango Anbarı",
    batches: Array.from({ length: 5 }, (_, i) => ({
      id: `mango-${i + 1}`,
      name: `Mango ${i + 1}`,
      batchNumber: i + 1,
      rolls: Array.from({ length: Math.floor(Math.random() * 18) + 12 }, (_, rollIndex) => ({
        id: `mango-${i + 1}-roll-${rollIndex + 1}`,
        rollNumber: rollIndex + 1,
        checked: Math.random() > 0.7,
      })),
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
        rolls: Array.from({ length: Math.floor(Math.random() * 25) + 15 }, (_, rollIndex) => ({
          id: `zeytun-1-roll-${rollIndex + 1}`,
          rollNumber: rollIndex + 1,
          checked: Math.random() > 0.7,
        })),
        status: Math.random() > 0.3 ? "available" : "low",
      },
    ],
  },
];

const getStatusColor = (status: string, allRollsChecked: boolean) => {
  if (allRollsChecked) {
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
  const [warehouseData, setWarehouseData] = useState(warehouses);

  const handleRollToggle = (warehouseIndex: number, batchIndex: number, rollIndex: number) => {
    setWarehouseData(prev => {
      const newData = [...prev];
      newData[warehouseIndex].batches[batchIndex].rolls[rollIndex].checked = 
        !newData[warehouseIndex].batches[batchIndex].rolls[rollIndex].checked;
      return newData;
    });
  };
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
        {warehouseData.map((warehouse, warehouseIndex) => {
          const totalRolls = warehouse.batches.reduce((sum, batch) => sum + batch.rolls.length, 0);
          const checkedRolls = warehouse.batches.reduce((sum, batch) => sum + batch.rolls.filter(roll => roll.checked).length, 0);
          const availableRolls = totalRolls - checkedRolls;

          return (
            <Card key={warehouse.name}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl">{warehouse.name}</CardTitle>
                  <div className="flex gap-2 text-sm text-muted-foreground">
                    <span>Ümumi Rulon: {totalRolls}</span>
                    <span>•</span>
                    <span className="text-success">Çıxarıldı: {checkedRolls}</span>
                    <span>•</span>
                    <span className="text-info">Mövcud: {availableRolls}</span>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {warehouse.batches.map((batch, batchIndex) => {
                    const batchCheckedRolls = batch.rolls.filter(roll => roll.checked).length;
                    const batchAvailableRolls = batch.rolls.length - batchCheckedRolls;
                    const allRollsChecked = batchCheckedRolls === batch.rolls.length;

                    return (
                      <div key={batch.id} className="space-y-3">
                        <div className="flex items-center justify-between border-b pb-2">
                          <div className="flex items-center gap-3">
                            <h3 className={`text-lg font-semibold ${allRollsChecked ? "line-through text-muted-foreground" : ""}`}>
                              {batch.name} - Partiya #{batch.batchNumber}
                            </h3>
                            <Badge className={getStatusColor(batch.status, allRollsChecked)} variant="secondary">
                              {allRollsChecked ? "Tamamlandı" : batch.status === "available" ? "Mövcud" : "Az"}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-3 text-sm text-muted-foreground">
                            <span>Çıxarıldı: {batchCheckedRolls}</span>
                            <span>•</span>
                            <span>Mövcud: {batchAvailableRolls}</span>
                            <div className="flex gap-1 ml-3">
                              <Button variant="ghost" size="icon" className="h-7 w-7">
                                <Edit className="h-3 w-3" />
                              </Button>
                              <Button variant="ghost" size="icon" className="h-7 w-7">
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        </div>
                        
                        <div className="rounded-lg border">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead className="w-16">Çıxış</TableHead>
                                <TableHead>Rulon №</TableHead>
                                <TableHead>Vəziyyət</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {batch.rolls.map((roll, rollIndex) => (
                                <TableRow 
                                  key={roll.id}
                                  className={roll.checked ? "bg-success/10" : ""}
                                >
                                  <TableCell>
                                    <Checkbox
                                      checked={roll.checked}
                                      onCheckedChange={() => handleRollToggle(warehouseIndex, batchIndex, rollIndex)}
                                      className="h-4 w-4"
                                    />
                                  </TableCell>
                                  <TableCell className={roll.checked ? "line-through text-muted-foreground" : ""}>
                                    Rulon #{roll.rollNumber}
                                  </TableCell>
                                  <TableCell>
                                    <Badge 
                                      variant="secondary" 
                                      className={roll.checked ? "bg-success text-success-foreground" : "bg-info text-info-foreground"}
                                    >
                                      {roll.checked ? "Çıxarıldı" : "Anbarda"}
                                    </Badge>
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}