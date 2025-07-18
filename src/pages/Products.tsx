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
      products: {
        "ALB-001": {
          sizes: Array.from({ length: Math.floor(Math.random() * 4) + 2 }, (_, sizeIndex) => ({
            id: `albali-${i + 1}-ALB-001-size-${sizeIndex + 1}`,
            sizeLabel: `${50 + sizeIndex * 10}x${30 + sizeIndex * 5} sm`,
            rollCount: Math.floor(Math.random() * 15) + 5,
            checkedRolls: Math.floor(Math.random() * 8),
          })),
        },
        "ALB-002": {
          sizes: Array.from({ length: Math.floor(Math.random() * 3) + 2 }, (_, sizeIndex) => ({
            id: `albali-${i + 1}-ALB-002-size-${sizeIndex + 1}`,
            sizeLabel: `${60 + sizeIndex * 15}x${40 + sizeIndex * 10} sm`,
            rollCount: Math.floor(Math.random() * 12) + 8,
            checkedRolls: Math.floor(Math.random() * 6),
          })),
        },
        "ALB-003": {
          sizes: Array.from({ length: Math.floor(Math.random() * 3) + 1 }, (_, sizeIndex) => ({
            id: `albali-${i + 1}-ALB-003-size-${sizeIndex + 1}`,
            sizeLabel: `${70 + sizeIndex * 20}x${50 + sizeIndex * 15} sm`,
            rollCount: Math.floor(Math.random() * 10) + 6,
            checkedRolls: Math.floor(Math.random() * 5),
          })),
        },
      },
      status: Math.random() > 0.3 ? "available" : "low",
    })),
  },
  {
    name: "Qarağat Anbarı",
    batches: Array.from({ length: 4 }, (_, i) => ({
      id: `qaragat-${i + 1}`,
      name: `Qarağat ${i + 1}`,
      batchNumber: i + 1,
      products: {
        "QAR-001": {
          sizes: Array.from({ length: Math.floor(Math.random() * 4) + 2 }, (_, sizeIndex) => ({
            id: `qaragat-${i + 1}-QAR-001-size-${sizeIndex + 1}`,
            sizeLabel: `${55 + sizeIndex * 12}x${35 + sizeIndex * 8} sm`,
            rollCount: Math.floor(Math.random() * 18) + 10,
            checkedRolls: Math.floor(Math.random() * 9),
          })),
        },
        "QAR-002": {
          sizes: Array.from({ length: Math.floor(Math.random() * 3) + 2 }, (_, sizeIndex) => ({
            id: `qaragat-${i + 1}-QAR-002-size-${sizeIndex + 1}`,
            sizeLabel: `${65 + sizeIndex * 18}x${45 + sizeIndex * 12} sm`,
            rollCount: Math.floor(Math.random() * 14) + 7,
            checkedRolls: Math.floor(Math.random() * 7),
          })),
        },
      },
      status: Math.random() > 0.3 ? "available" : "low",
    })),
  },
  {
    name: "Mango Anbarı",
    batches: Array.from({ length: 5 }, (_, i) => ({
      id: `mango-${i + 1}`,
      name: `Mango ${i + 1}`,
      batchNumber: i + 1,
      products: {
        "MNG-001": {
          sizes: Array.from({ length: Math.floor(Math.random() * 5) + 3 }, (_, sizeIndex) => ({
            id: `mango-${i + 1}-MNG-001-size-${sizeIndex + 1}`,
            sizeLabel: `${48 + sizeIndex * 8}x${32 + sizeIndex * 6} sm`,
            rollCount: Math.floor(Math.random() * 16) + 8,
            checkedRolls: Math.floor(Math.random() * 8),
          })),
        },
        "MNG-002": {
          sizes: Array.from({ length: Math.floor(Math.random() * 4) + 2 }, (_, sizeIndex) => ({
            id: `mango-${i + 1}-MNG-002-size-${sizeIndex + 1}`,
            sizeLabel: `${58 + sizeIndex * 14}x${38 + sizeIndex * 9} sm`,
            rollCount: Math.floor(Math.random() * 13) + 6,
            checkedRolls: Math.floor(Math.random() * 6),
          })),
        },
        "MNG-003": {
          sizes: Array.from({ length: Math.floor(Math.random() * 3) + 2 }, (_, sizeIndex) => ({
            id: `mango-${i + 1}-MNG-003-size-${sizeIndex + 1}`,
            sizeLabel: `${68 + sizeIndex * 16}x${48 + sizeIndex * 11} sm`,
            rollCount: Math.floor(Math.random() * 11) + 5,
            checkedRolls: Math.floor(Math.random() * 5),
          })),
        },
      },
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
        products: {
          "ZEY-001": {
            sizes: Array.from({ length: Math.floor(Math.random() * 6) + 4 }, (_, sizeIndex) => ({
              id: `zeytun-1-ZEY-001-size-${sizeIndex + 1}`,
              sizeLabel: `${52 + sizeIndex * 10}x${36 + sizeIndex * 7} sm`,
              rollCount: Math.floor(Math.random() * 20) + 10,
              checkedRolls: Math.floor(Math.random() * 10),
            })),
          },
          "ZEY-002": {
            sizes: Array.from({ length: Math.floor(Math.random() * 4) + 3 }, (_, sizeIndex) => ({
              id: `zeytun-1-ZEY-002-size-${sizeIndex + 1}`,
              sizeLabel: `${62 + sizeIndex * 12}x${42 + sizeIndex * 8} sm`,
              rollCount: Math.floor(Math.random() * 15) + 8,
              checkedRolls: Math.floor(Math.random() * 7),
            })),
          },
        },
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

  const handleRollToggle = (warehouseIndex: number, batchIndex: number, productCode: string, sizeIndex: number) => {
    setWarehouseData(prev => {
      const newData = [...prev];
      const currentSize = newData[warehouseIndex].batches[batchIndex].products[productCode].sizes[sizeIndex];
      if (currentSize.checkedRolls < currentSize.rollCount) {
        currentSize.checkedRolls += 1;
      } else {
        currentSize.checkedRolls = 0;
      }
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
          const totalProducts = warehouse.batches.reduce((sum, batch) => sum + Object.keys(batch.products || {}).length, 0);
          const totalSizes = warehouse.batches.reduce((sum, batch) => 
            sum + Object.values(batch.products || {}).reduce((prodSum: number, product: any) => prodSum + (product.sizes?.length || 0), 0), 0);
          const totalRolls = warehouse.batches.reduce((sum, batch) => 
            sum + Object.values(batch.products || {}).reduce((prodSum: number, product: any) => 
              prodSum + (product.sizes?.reduce((sizeSum: number, size: any) => sizeSum + (size.rollCount || 0), 0) || 0), 0), 0);
          const checkedRolls = warehouse.batches.reduce((sum, batch) => 
            sum + Object.values(batch.products || {}).reduce((prodSum: number, product: any) => 
              prodSum + (product.sizes?.reduce((sizeSum: number, size: any) => sizeSum + (size.checkedRolls || 0), 0) || 0), 0), 0);

          return (
            <Card key={warehouse.name}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl">{warehouse.name}</CardTitle>
                  <div className="flex gap-2 text-sm text-muted-foreground">
                    <span>Artikul: {totalProducts}</span>
                    <span>•</span>
                    <span>Ölçü: {totalSizes}</span>
                    <span>•</span>
                    <span>Rulon: {totalRolls}</span>
                    <span>•</span>
                    <span className="text-success">Çıxarıldı: {checkedRolls}</span>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {warehouse.batches.map((batch, batchIndex) => {
                    const batchTotalRolls = Object.values(batch.products || {}).reduce((sum: number, product: any) => 
                      sum + (product.sizes?.reduce((sizeSum: number, size: any) => sizeSum + (size.rollCount || 0), 0) || 0), 0);
                    const batchCheckedRolls = Object.values(batch.products || {}).reduce((sum: number, product: any) => 
                      sum + (product.sizes?.reduce((sizeSum: number, size: any) => sizeSum + (size.checkedRolls || 0), 0) || 0), 0);
                    const allRollsChecked = batchCheckedRolls === batchTotalRolls && batchTotalRolls > 0;

                    // Get all unique sizes across all products
                    const allSizes = new Set<string>();
                    Object.values(batch.products || {}).forEach((product: any) => {
                      product.sizes?.forEach((size: any) => allSizes.add(size.sizeLabel));
                    });
                    const uniqueSizes = Array.from(allSizes).sort();

                    return (
                      <div key={batch.id} className="space-y-4">
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
                            <span>Çıxarıldı: {batchCheckedRolls}/{batchTotalRolls}</span>
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
                        
                        <div className="rounded-lg border overflow-auto">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead className="w-32 sticky left-0 bg-background z-10">Ölçü</TableHead>
                                {Object.keys(batch.products || {}).map((productCode) => (
                                  <TableHead key={productCode} className="text-center min-w-24">
                                    <div className="font-bold text-primary">{productCode}</div>
                                  </TableHead>
                                ))}
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {uniqueSizes.map((sizeLabel: string) => (
                                <TableRow key={sizeLabel}>
                                  <TableCell className="font-medium sticky left-0 bg-background z-10 border-r">
                                    {sizeLabel}
                                  </TableCell>
                                  {Object.entries(batch.products || {}).map(([productCode, product]: [string, any]) => {
                                    const sizeData = product.sizes?.find((size: any) => size.sizeLabel === sizeLabel);
                                    const sizeIndex = product.sizes?.findIndex((size: any) => size.sizeLabel === sizeLabel) || -1;
                                    
                                    if (!sizeData) {
                                      return (
                                        <TableCell key={productCode} className="text-center text-muted-foreground">
                                          -
                                        </TableCell>
                                      );
                                    }

                                    const isFullyChecked = sizeData.checkedRolls === sizeData.rollCount;
                                    const hasPartiallyChecked = sizeData.checkedRolls > 0 && sizeData.checkedRolls < sizeData.rollCount;
                                    
                                    return (
                                      <TableCell key={productCode} className="text-center">
                                        <div className="flex flex-col items-center gap-1">
                                          <Checkbox
                                            checked={isFullyChecked}
                                            onCheckedChange={() => handleRollToggle(warehouseIndex, batchIndex, productCode, sizeIndex)}
                                            className="h-4 w-4"
                                          />
                                          <div className="text-xs">
                                            <span className={isFullyChecked ? "text-success font-bold" : hasPartiallyChecked ? "text-warning font-medium" : ""}>
                                              {sizeData.checkedRolls}
                                            </span>
                                            <span className="text-muted-foreground">/{sizeData.rollCount}</span>
                                          </div>
                                          <Badge 
                                            variant="secondary" 
                                            className={`text-xs ${
                                              isFullyChecked ? "bg-success text-success-foreground" : 
                                              hasPartiallyChecked ? "bg-warning text-warning-foreground" : 
                                              "bg-info text-info-foreground"
                                            }`}
                                          >
                                            {isFullyChecked ? "✓" : hasPartiallyChecked ? "◐" : "○"}
                                          </Badge>
                                        </div>
                                      </TableCell>
                                    );
                                  })}
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