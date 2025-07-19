import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import { Search, Plus, Edit, Trash2, CheckCircle, Warehouse, ChevronDown, ChevronUp } from "lucide-react";

const warehouses = [
  {
    name: "Albalı",
    batches: Array.from({ length: 9 }, (_, i) => ({
      id: `albali-${i + 1}`,
      name: `Albalı ${i + 1}`,
      batchNumber: i + 1,
      products: [
        {
          id: `albali-${i + 1}-product-1`,
          name: "ALB-001",
          sizes: Array.from({ length: Math.floor(Math.random() * 5) + 3 }, (_, sizeIndex) => ({
            id: `albali-${i + 1}-product-1-size-${sizeIndex + 1}`,
            sizeLabel: `${50 + sizeIndex * 10}x${30 + sizeIndex * 5} sm`,
            rollCount: Math.floor(Math.random() * 15) + 5,
            checkedRolls: Math.floor(Math.random() * 8),
          })),
        },
        {
          id: `albali-${i + 1}-product-2`,
          name: "ALB-002",
          sizes: Array.from({ length: Math.floor(Math.random() * 4) + 2 }, (_, sizeIndex) => ({
            id: `albali-${i + 1}-product-2-size-${sizeIndex + 1}`,
            sizeLabel: `${60 + sizeIndex * 15}x${40 + sizeIndex * 10} sm`,
            rollCount: Math.floor(Math.random() * 12) + 8,
            checkedRolls: Math.floor(Math.random() * 6),
          })),
        },
        {
          id: `albali-${i + 1}-product-3`,
          name: "ALB-003",
          sizes: Array.from({ length: Math.floor(Math.random() * 3) + 2 }, (_, sizeIndex) => ({
            id: `albali-${i + 1}-product-3-size-${sizeIndex + 1}`,
            sizeLabel: `${70 + sizeIndex * 20}x${50 + sizeIndex * 15} sm`,
            rollCount: Math.floor(Math.random() * 10) + 6,
            checkedRolls: Math.floor(Math.random() * 5),
          })),
        },
      ],
      status: Math.random() > 0.3 ? "available" : "low",
    })),
  },
  {
    name: "Qarağat",
    batches: Array.from({ length: 4 }, (_, i) => ({
      id: `qaragat-${i + 1}`,
      name: `Qarağat ${i + 1}`,
      batchNumber: i + 1,
      products: [
        {
          id: `qaragat-${i + 1}-product-1`,
          name: "QAR-001",
          sizes: Array.from({ length: Math.floor(Math.random() * 4) + 2 }, (_, sizeIndex) => ({
            id: `qaragat-${i + 1}-product-1-size-${sizeIndex + 1}`,
            sizeLabel: `${55 + sizeIndex * 12}x${35 + sizeIndex * 8} sm`,
            rollCount: Math.floor(Math.random() * 18) + 10,
            checkedRolls: Math.floor(Math.random() * 9),
          })),
        },
        {
          id: `qaragat-${i + 1}-product-2`,
          name: "QAR-002",
          sizes: Array.from({ length: Math.floor(Math.random() * 3) + 2 }, (_, sizeIndex) => ({
            id: `qaragat-${i + 1}-product-2-size-${sizeIndex + 1}`,
            sizeLabel: `${65 + sizeIndex * 18}x${45 + sizeIndex * 12} sm`,
            rollCount: Math.floor(Math.random() * 14) + 7,
            checkedRolls: Math.floor(Math.random() * 7),
          })),
        },
      ],
      status: Math.random() > 0.3 ? "available" : "low",
    })),
  },
  {
    name: "Mango",
    batches: Array.from({ length: 5 }, (_, i) => ({
      id: `mango-${i + 1}`,
      name: `Mango ${i + 1}`,
      batchNumber: i + 1,
      products: [
        {
          id: `mango-${i + 1}-product-1`,
          name: "MNG-001",
          sizes: Array.from({ length: Math.floor(Math.random() * 5) + 3 }, (_, sizeIndex) => ({
            id: `mango-${i + 1}-product-1-size-${sizeIndex + 1}`,
            sizeLabel: `${48 + sizeIndex * 8}x${32 + sizeIndex * 6} sm`,
            rollCount: Math.floor(Math.random() * 16) + 8,
            checkedRolls: Math.floor(Math.random() * 8),
          })),
        },
        {
          id: `mango-${i + 1}-product-2`,
          name: "MNG-002",
          sizes: Array.from({ length: Math.floor(Math.random() * 4) + 2 }, (_, sizeIndex) => ({
            id: `mango-${i + 1}-product-2-size-${sizeIndex + 1}`,
            sizeLabel: `${58 + sizeIndex * 14}x${38 + sizeIndex * 9} sm`,
            rollCount: Math.floor(Math.random() * 13) + 6,
            checkedRolls: Math.floor(Math.random() * 6),
          })),
        },
        {
          id: `mango-${i + 1}-product-3`,
          name: "MNG-003",
          sizes: Array.from({ length: Math.floor(Math.random() * 3) + 2 }, (_, sizeIndex) => ({
            id: `mango-${i + 1}-product-3-size-${sizeIndex + 1}`,
            sizeLabel: `${68 + sizeIndex * 16}x${48 + sizeIndex * 11} sm`,
            rollCount: Math.floor(Math.random() * 11) + 5,
            checkedRolls: Math.floor(Math.random() * 5),
          })),
        },
      ],
      status: Math.random() > 0.3 ? "available" : "low",
    })),
  },
  {
    name: "Zeytun",
    batches: [
      {
        id: "zeytun-1",
        name: "Zeytun 1",
        batchNumber: 1,
        products: [
          {
            id: "zeytun-1-product-1",
            name: "ZEY-001",
            sizes: Array.from({ length: Math.floor(Math.random() * 6) + 4 }, (_, sizeIndex) => ({
              id: `zeytun-1-product-1-size-${sizeIndex + 1}`,
              sizeLabel: `${52 + sizeIndex * 10}x${36 + sizeIndex * 7} sm`,
              rollCount: Math.floor(Math.random() * 20) + 10,
              checkedRolls: Math.floor(Math.random() * 10),
            })),
          },
          {
            id: "zeytun-1-product-2",
            name: "ZEY-002",
            sizes: Array.from({ length: Math.floor(Math.random() * 4) + 3 }, (_, sizeIndex) => ({
              id: `zeytun-1-product-2-size-${sizeIndex + 1}`,
              sizeLabel: `${62 + sizeIndex * 12}x${42 + sizeIndex * 8} sm`,
              rollCount: Math.floor(Math.random() * 15) + 8,
              checkedRolls: Math.floor(Math.random() * 7),
            })),
          },
        ],
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
  const [newWarehouseName, setNewWarehouseName] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [expandedWarehouses, setExpandedWarehouses] = useState<{[key: string]: boolean}>({});
  const [editingBatch, setEditingBatch] = useState<{warehouseIndex: number, batchIndex: number} | null>(null);
  const [editBatchName, setEditBatchName] = useState("");

  const handleRollToggle = (warehouseIndex: number, batchIndex: number, productIndex: number, sizeIndex: number) => {
    setWarehouseData(prev => {
      const newData = [...prev];
      const currentSize = newData[warehouseIndex].batches[batchIndex].products[productIndex].sizes[sizeIndex];
      if (currentSize.checkedRolls < currentSize.rollCount) {
        currentSize.checkedRolls += 1;
      } else {
        currentSize.checkedRolls = 0;
      }
      return newData;
    });
  };

  const handleAddWarehouse = () => {
    if (newWarehouseName.trim()) {
      const newWarehouse = {
        name: newWarehouseName.trim(),
        batches: []
      };
      setWarehouseData(prev => [...prev, newWarehouse]);
      setNewWarehouseName("");
      setIsDialogOpen(false);
    }
  };

  const handleEditBatch = (warehouseIndex: number, batchIndex: number) => {
    const batch = warehouseData[warehouseIndex].batches[batchIndex];
    setEditBatchName(batch.name);
    setEditingBatch({warehouseIndex, batchIndex});
  };

  const handleSaveEdit = () => {
    if (editingBatch) {
      setWarehouseData(prev => {
        const newData = [...prev];
        newData[editingBatch.warehouseIndex].batches[editingBatch.batchIndex].name = editBatchName;
        return newData;
      });
      setEditingBatch(null);
      setEditBatchName("");
    }
  };

  const handleCancelEdit = () => {
    setEditingBatch(null);
    setEditBatchName("");
  };

  const handleDeleteBatch = (warehouseIndex: number, batchIndex: number) => {
    setWarehouseData(prev => {
      const newData = [...prev];
      newData[warehouseIndex].batches.splice(batchIndex, 1);
      return newData;
    });
  };

  const toggleWarehouse = (warehouseName: string) => {
    setExpandedWarehouses(prev => ({
      ...prev,
      [warehouseName]: !prev[warehouseName]
    }));
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
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Warehouse className="mr-2 h-4 w-4" />
                Yeni Anbar
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Yeni Anbar Əlavə Et</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="warehouse-name">Anbar Adı</Label>
                  <Input
                    id="warehouse-name"
                    placeholder="Anbar adını daxil edin..."
                    value={newWarehouseName}
                    onChange={(e) => setNewWarehouseName(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddWarehouse()}
                  />
                </div>
                <div className="flex gap-2 justify-end">
                  <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Ləğv et
                  </Button>
                  <Button onClick={handleAddWarehouse} disabled={!newWarehouseName.trim()}>
                    Əlavə et
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
          <Button variant="outline">
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
          const totalProducts = warehouse.batches.reduce((sum, batch) => sum + (batch.products?.length || 0), 0);
          const totalSizes = warehouse.batches.reduce((sum, batch) => 
            sum + (batch.products?.reduce((prodSum, product) => prodSum + (product.sizes?.length || 0), 0) || 0), 0);
          const totalRolls = warehouse.batches.reduce((sum, batch) => 
            sum + (batch.products?.reduce((prodSum, product) => 
              prodSum + (product.sizes?.reduce((sizeSum, size) => sizeSum + (size.rollCount || 0), 0) || 0), 0) || 0), 0);
          const checkedRolls = warehouse.batches.reduce((sum, batch) => 
            sum + (batch.products?.reduce((prodSum, product) => 
              prodSum + (product.sizes?.reduce((sizeSum, size) => sizeSum + (size.checkedRolls || 0), 0) || 0), 0) || 0), 0);

          return (
            <Card key={warehouse.name}>
              <CardHeader className="cursor-pointer" onClick={() => toggleWarehouse(warehouse.name)}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      {expandedWarehouses[warehouse.name] ? 
                        <ChevronUp className="h-5 w-5" /> : 
                        <ChevronDown className="h-5 w-5" />
                      }
                      <Warehouse className="h-5 w-5 text-primary" />
                    </div>
                    <CardTitle className="text-xl">{warehouse.name}</CardTitle>
                  </div>
                  <div className="flex gap-2 text-sm text-muted-foreground">
                    <span>Məhsul: {totalProducts}</span>
                    <span>•</span>
                    <span>Ölçü: {totalSizes}</span>
                    <span>•</span>
                    <span>Rulon: {totalRolls}</span>
                    <span>•</span>
                    <span className="text-success">Çıxarıldı: {checkedRolls}</span>
                  </div>
                </div>
              </CardHeader>
              {expandedWarehouses[warehouse.name] && (
                <CardContent>
                  {warehouse.batches.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <Warehouse className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>Bu anbarda hələ partiya yoxdur</p>
                      <Button variant="outline" className="mt-4">
                        <Plus className="mr-2 h-4 w-4" />
                        İlk Partiya Əlavə Et
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {warehouse.batches.map((batch, batchIndex) => {
                    const batchTotalRolls = batch.products?.reduce((sum, product) => 
                      sum + (product.sizes?.reduce((sizeSum, size) => sizeSum + (size.rollCount || 0), 0) || 0), 0) || 0;
                    const batchCheckedRolls = batch.products?.reduce((sum, product) => 
                      sum + (product.sizes?.reduce((sizeSum, size) => sizeSum + (size.checkedRolls || 0), 0) || 0), 0) || 0;
                    const allRollsChecked = batchCheckedRolls === batchTotalRolls && batchTotalRolls > 0;

                    return (
                      <div key={batch.id} className="space-y-4">
                        <div className="flex items-center justify-between border-b pb-2">
                          <div className="flex items-center gap-3">
                            {editingBatch?.warehouseIndex === warehouseIndex && editingBatch?.batchIndex === batchIndex ? (
                              <div className="flex items-center gap-2">
                                <Input
                                  value={editBatchName}
                                  onChange={(e) => setEditBatchName(e.target.value)}
                                  className="h-8 w-48"
                                  onKeyDown={(e) => e.key === 'Enter' && handleSaveEdit()}
                                />
                                <Button size="sm" onClick={handleSaveEdit}>Yadda saxla</Button>
                                <Button variant="outline" size="sm" onClick={handleCancelEdit}>Ləğv et</Button>
                              </div>
                            ) : (
                              <h3 className={`text-lg font-semibold ${allRollsChecked ? "line-through text-muted-foreground" : ""}`}>
                                {batch.name} - Partiya #{batch.batchNumber}
                              </h3>
                            )}
                            <Badge className={getStatusColor(batch.status, allRollsChecked)} variant="secondary">
                              {allRollsChecked ? "Tamamlandı" : batch.status === "available" ? "Mövcud" : "Az"}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-3 text-sm text-muted-foreground">
                            <span>Çıxarıldı: {batchCheckedRolls}/{batchTotalRolls}</span>
                            <div className="flex gap-1 ml-3">
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-7 w-7"
                                onClick={() => handleEditBatch(warehouseIndex, batchIndex)}
                              >
                                <Edit className="h-3 w-3" />
                              </Button>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    className="h-7 w-7"
                                  >
                                    <Trash2 className="h-3 w-3" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Partiyanı sil</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Bu partiyanı silmək istədiyinizə əminsiniz? Bu əməliyyat geri qaytarıla bilməz.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Ləğv et</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => handleDeleteBatch(warehouseIndex, batchIndex)}>
                                      Sil
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          </div>
                        </div>
                        
                        {batch.products?.map((product, productIndex) => (
                          <div key={product.id} className="ml-4 space-y-3">
                            <h4 className="text-md font-medium text-primary">{product.name}</h4>
                            <div className="rounded-lg border">
                              <Table>
                                <TableHeader>
                                  <TableRow>
                                    <TableHead className="w-16">Çıxış</TableHead>
                                    <TableHead>Ölçü</TableHead>
                                    <TableHead>Rulon Sayı</TableHead>
                                    <TableHead>Çıxarıldı</TableHead>
                                    <TableHead>Vəziyyət</TableHead>
                                  </TableRow>
                                </TableHeader>
                                <TableBody>
                                  {product.sizes?.map((size, sizeIndex) => {
                                    const isFullyChecked = size.checkedRolls === size.rollCount;
                                    const hasPartiallyChecked = size.checkedRolls > 0 && size.checkedRolls < size.rollCount;
                                    
                                    return (
                                      <TableRow 
                                        key={size.id}
                                        className={isFullyChecked ? "bg-success/10" : hasPartiallyChecked ? "bg-warning/10" : ""}
                                      >
                                        <TableCell>
                                          <Checkbox
                                            checked={isFullyChecked}
                                            onCheckedChange={() => handleRollToggle(warehouseIndex, batchIndex, productIndex, sizeIndex)}
                                            className="h-4 w-4"
                                          />
                                        </TableCell>
                                        <TableCell className={isFullyChecked ? "line-through text-muted-foreground" : ""}>
                                          {size.sizeLabel}
                                        </TableCell>
                                        <TableCell className={isFullyChecked ? "line-through text-muted-foreground" : ""}>
                                          {size.rollCount} ədəd
                                        </TableCell>
                                        <TableCell>
                                          <span className={isFullyChecked ? "text-success font-medium" : hasPartiallyChecked ? "text-warning font-medium" : ""}>
                                            {size.checkedRolls}/{size.rollCount}
                                          </span>
                                        </TableCell>
                                        <TableCell>
                                          <Badge 
                                            variant="secondary" 
                                            className={
                                              isFullyChecked ? "bg-success text-success-foreground" : 
                                              hasPartiallyChecked ? "bg-warning text-warning-foreground" : 
                                              "bg-info text-info-foreground"
                                            }
                                          >
                                            {isFullyChecked ? "Tamamlandı" : hasPartiallyChecked ? "Qismən" : "Anbarda"}
                                          </Badge>
                                        </TableCell>
                                      </TableRow>
                                    );
                                  })}
                                </TableBody>
                              </Table>
                            </div>
                          </div>
                        ))}
                      </div>
                    );
                      })}
                    </div>
                  )}
                </CardContent>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}