import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Plus, Save, Check, ChevronsUpDown, X, Download } from "lucide-react";
import { useProductStore } from "@/lib/productStore";
import { usePackagingStore } from "@/lib/packagingStore";
import { usePackagingMethodsStore } from "@/lib/packagingMethodsStore";
import { useWarehouseStore } from "@/lib/warehouseStore";
import { useOperationHistory } from "@/hooks/useOperationHistory";
import { OperationIcon } from "@/components/OperationIcon";
import { DateTimePicker } from "@/components/DateTimePicker";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";
import jsPDF from 'jspdf';
import { generateTimestampId } from "@/utils/idGeneration";

type ProductEntry = {
  productId: string;
  packaging: {type: string, count: number, method?: string}[];
};

export default function AddOperation() {
  const { products, updateWarehouseStock, updateProductPackaging } = useProductStore();
  const { packagingOptions, addPackagingOption } = usePackagingStore();
  const { packagingMethods, addPackagingMethod } = usePackagingMethodsStore();
  const { warehouses } = useWarehouseStore();
  const { addOperation, operations, formatTimestamp, getOperationColor } = useOperationHistory();
  const [operationType, setOperationType] = useState("");
  const [selectedWarehouse, setSelectedWarehouse] = useState("");
  const [selectedDestinationWarehouse, setSelectedDestinationWarehouse] = useState("");
  const [batchName, setBatchName] = useState("");
  const [selectedProducts, setSelectedProducts] = useState<ProductEntry[]>([]);
  const [currentProduct, setCurrentProduct] = useState("");
  const [currentPackaging, setCurrentPackaging] = useState<{type: string, count: number, method?: string}[]>([]);
  const [notes, setNotes] = useState("");
  const [packagingOpen, setPackagingOpen] = useState(false);
  const [customPackaging, setCustomPackaging] = useState("");
  const [currentPackagingType, setCurrentPackagingType] = useState("");
  const [currentPackageCount, setCurrentPackageCount] = useState("");
  const [currentPackagingMethod, setCurrentPackagingMethod] = useState("");
  const [customPackagingMethod, setCustomPackagingMethod] = useState("");
  const [operationDateTime, setOperationDateTime] = useState<Date>(new Date());

  const getCurrentProductTotalQuantity = () => {
    return currentPackaging.reduce((total, item) => {
      // Each package contains the specified quantity of product
      const quantityPerPackage = parseInt(item.type.toString().split(/[+()]/)[0]);
      const packageCount = parseInt(item.count.toString());
      if (isNaN(quantityPerPackage) || isNaN(packageCount) || packageCount <= 0) return total;
      return total + (quantityPerPackage * packageCount);
    }, 0);
  };

  const getProductTotalQuantity = (packaging: {type: string, count: number, method?: string}[]) => {
    return packaging.reduce((total, item) => {
      // Each package contains the specified quantity of product
      const quantityPerPackage = parseInt(item.type.toString().split(/[+()]/)[0]);
      const packageCount = parseInt(item.count.toString());
      if (isNaN(quantityPerPackage) || isNaN(packageCount) || packageCount <= 0) return total;
      return total + (quantityPerPackage * packageCount);
    }, 0);
  };

  const handleAddPackaging = () => {
    if (currentPackagingType && currentPackageCount && currentPackagingMethod) {
      const countNum = parseInt(currentPackageCount);
      if (!isNaN(countNum) && countNum > 0) {
        // Check if this packaging type and method combination already exists
        const existingIndex = currentPackaging.findIndex(
          item => item.type === currentPackagingType && item.method === currentPackagingMethod
        );
        
        if (existingIndex >= 0) {
          // Update existing packaging quantity
          setCurrentPackaging(prev => 
            prev.map((item, index) => 
              index === existingIndex 
                ? { ...item, count: item.count + countNum }
                : item
            )
          );
        } else {
          // Add new packaging entry
          setCurrentPackaging(prev => [...prev, { 
            type: currentPackagingType, 
            count: countNum,
            method: currentPackagingMethod
          }]);
        }
        
        setCurrentPackagingType("");
        setCurrentPackageCount("");
        setCurrentPackagingMethod("");
        setPackagingOpen(false);
      }
    }
  };

  const handleRemovePackaging = (index: number) => {
    setCurrentPackaging(prev => prev.filter((_, i) => i !== index));
  };

  const handleAddCustomPackaging = () => {
    if (customPackaging.trim() && !packagingOptions.includes(customPackaging.trim())) {
      addPackagingOption(customPackaging.trim());
      setCurrentPackagingType(customPackaging.trim());
      setCustomPackaging("");
    }
  };

  const handleAddCustomPackagingMethod = () => {
    if (customPackagingMethod.trim() && !packagingMethods.includes(customPackagingMethod.trim())) {
      addPackagingMethod(customPackagingMethod.trim());
      setCurrentPackagingMethod(customPackagingMethod.trim());
      setCustomPackagingMethod("");
    }
  };

  const handleAddProduct = () => {
    if (currentProduct && currentPackaging.length > 0) {
      setSelectedProducts(prev => [...prev, {
        productId: currentProduct,
        packaging: [...currentPackaging]
      }]);
      // Reset only packaging, keep product selection for easy adding of more packaging
      setCurrentPackaging([]);
      setCurrentPackagingType("");
      setCurrentPackageCount("");
      setCurrentPackagingMethod("");
    }
  };

  const handleRemoveProduct = (index: number) => {
    setSelectedProducts(prev => prev.filter((_, i) => i !== index));
  };

  const getProductName = (productId: string) => {
    const product = products.find(p => p.id === productId);
    return product ? `${product.name} (${product.article})` : "";
  };

  const generateOperationPDF = (operationTitle: string, operationDate: string, productName: string, quantity: number) => {
    const doc = new jsPDF();
    
    // PDF başlığı
    doc.setFontSize(20);
    doc.text('Əməliyyat Qaimə', 20, 30);
    
    // Əməliyyat məlumatları
    doc.setFontSize(12);
    doc.text(`Əməliyyat: ${operationTitle}`, 20, 50);
    doc.text(`Tarix: ${operationDate}`, 20, 65);
    
    // Məhsul məlumatları
    doc.setFontSize(14);
    doc.text('Məhsul Məlumatları:', 20, 85);
    doc.setFontSize(12);
    doc.text(`Məhsul: ${productName}`, 20, 100);
    doc.text(`Miqdar: ${quantity}`, 20, 115);
    
    return doc;
  };

  const handleDownloadPDF = (operationTitle: string, operationDate: string, productName: string, quantity: number) => {
    const doc = generateOperationPDF(operationTitle, operationDate, productName, quantity);
    const timestamp = generateTimestampId();
    doc.save(`${operationTitle.replace(/\s+/g, '_')}_${timestamp}.pdf`);
  };

  const handlePrint = (operationTitle: string, operationDate: string, productName: string, quantity: number) => {
    const doc = generateOperationPDF(operationTitle, operationDate, productName, quantity);
    const pdfBlob = doc.output('blob');
    const url = URL.createObjectURL(pdfBlob);
    
    if (typeof window !== 'undefined') {
      const printWindow = window.open(url);
      if (printWindow) {
        printWindow.onload = () => {
          printWindow.print();
          URL.revokeObjectURL(url);
        };
      } else {
        URL.revokeObjectURL(url);
      }
    }
  };

  const handleSaveOperation = () => {
    // Enhanced validation
    if (!operationType) {
      toast({
        title: "Natamam məlumat",
        description: "Əməliyyat növünü seçin",
        variant: "destructive",
      });
      return;
    }
    
    if (selectedProducts.length === 0) {
      toast({
        title: "Natamam məlumat", 
        description: "Ən azı bir məhsul əlavə edin",
        variant: "destructive",
      });
      return;
    }

    // Validate warehouse selection for operations that require it
    const requiresWarehouse = ['incoming', 'outgoing', 'sale', 'əvvəldən_qalıq', 'transfer'];
    if (requiresWarehouse.includes(operationType) && !selectedWarehouse) {
      toast({
        title: "Natamam məlumat",
        description: "Anbar seçin",
        variant: "destructive",
      });
      return;
    }
    
    if (operationType === 'transfer' && !selectedDestinationWarehouse) {
      toast({
        title: "Natamam məlumat",
        description: "Təyinat anbarını seçin", 
        variant: "destructive",
      });
      return;
    }

    if (operationType === 'transfer' && selectedWarehouse === selectedDestinationWarehouse) {
      toast({
        title: "Səhv məlumat",
        description: "Mənbə və təyinat anbarları fərqli olmalıdır", 
        variant: "destructive",
      });
      return;
    }

    // Validate product quantities
    const hasZeroQuantity = selectedProducts.some(p => getProductTotalQuantity(p.packaging) <= 0);
    if (hasZeroQuantity) {
      toast({
        title: "Səhv məlumat",
        description: "Bütün məhsulların miqdarı 0-dan böyük olmalıdır", 
        variant: "destructive",
      });
      return;
    }

    try {
      // Add operations to history and update product store for each product
      selectedProducts.forEach(productEntry => {
        const product = products.find(p => p.id === productEntry.productId);
        if (product) {
          const totalQuantity = getProductTotalQuantity(productEntry.packaging);
          const warehouseName = selectedWarehouse || warehouses[0]?.name || 'Anbar 1';
          
          // Add to operation history with proper warehouse name and custom date/time
          addOperation({
            type: operationType as 'daxil' | 'xaric' | 'satış' | 'transfer' | 'əvvəldən_qalıq',
            productName: product.name,
            quantity: totalQuantity,
            warehouse: warehouseName,
            timestamp: operationDateTime
          });

          // Update product packaging with the types and quantities used in this operation
          const packagingUsed = productEntry.packaging.map(p => ({
            type: p.type,
            quantity: p.count
          }));
          updateProductPackaging(product.id, packagingUsed);

          // Update product stock based on operation type
          if (operationType === 'incoming' || operationType === 'əvvəldən_qalıq') {
            updateWarehouseStock(product.id, warehouseName, totalQuantity, 'increase');
          } else if (operationType === 'outgoing' || operationType === 'sale') {
            updateWarehouseStock(product.id, warehouseName, totalQuantity, 'decrease');
          } else if (operationType === 'transfer') {
            // Transfer from source to destination
            if (selectedDestinationWarehouse) {
              updateWarehouseStock(product.id, warehouseName, totalQuantity, 'decrease');
              updateWarehouseStock(product.id, selectedDestinationWarehouse, totalQuantity, 'increase');
            }
          }
        }
      });
      } catch (error) {
      toast({
        title: "Əməliyyat saxlanılmadı",
        description: "Əməliyyat saxlanılarkən xəta baş verdi",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Əməliyyat saxlanıldı",
      description: `${operationType} əməliyyatı uğurla saxlanıldı və məhsul miqdarları yeniləndi`,
    });

    // Clear form after save
    setSelectedProducts([]);
    setCurrentProduct("");
    setCurrentPackaging([]);
    setNotes("");
    setOperationType("");
    setSelectedWarehouse("");
    setSelectedDestinationWarehouse("");
    setBatchName("");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl md:text-2xl lg:text-3xl font-bold tracking-tight">Yeni Əməliyyat</h1>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Əməliyyat Məlumatları</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="operation-type">Əməliyyat Növü</Label>
              <Select value={operationType} onValueChange={setOperationType}>
                <SelectTrigger>
                  <SelectValue placeholder="Əməliyyat növünü seçin" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="əvvəldən_qalıq">Əvvəldən Qalıq</SelectItem>
                  <SelectItem value="incoming">Daxil olma</SelectItem>
                  <SelectItem value="outgoing">Çıxış</SelectItem>
                  <SelectItem value="sale">Satış</SelectItem>
                  <SelectItem value="return">Geri qaytarma</SelectItem>
                  <SelectItem value="transfer">Yerdəyişmə</SelectItem>
                  <SelectItem value="adjustment">Düzəliş</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {(operationType === "incoming" || operationType === "əvvəldən_qalıq") && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="warehouse">Anbar</Label>
                  <Select value={selectedWarehouse} onValueChange={setSelectedWarehouse}>
                    <SelectTrigger>
                      <SelectValue placeholder="Anbar seçin" />
                    </SelectTrigger>
                    <SelectContent>
                      {warehouses.map((warehouse) => (
                        <SelectItem key={warehouse.id} value={warehouse.name}>
                          {warehouse.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="batch-name">Partiya adı</Label>
                  <Input
                    id="batch-name"
                    placeholder="Partiya adını daxil edin"
                    value={batchName}
                    onChange={(e) => setBatchName(e.target.value)}
                  />
                </div>
              </>
            )}

            {operationType === "transfer" && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="source-warehouse">Mənbə Anbar</Label>
                  <Select value={selectedWarehouse} onValueChange={setSelectedWarehouse}>
                    <SelectTrigger>
                      <SelectValue placeholder="Mənbə anbarı seçin" />
                    </SelectTrigger>
                    <SelectContent>
                      {warehouses.map((warehouse) => (
                        <SelectItem key={warehouse.id} value={warehouse.name}>
                          {warehouse.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="destination-warehouse">Təyinat Anbar</Label>
                  <Select value={selectedDestinationWarehouse} onValueChange={setSelectedDestinationWarehouse}>
                    <SelectTrigger>
                      <SelectValue placeholder="Təyinat anbarı seçin" />
                    </SelectTrigger>
                    <SelectContent>
                      {warehouses.map((warehouse) => (
                        <SelectItem key={warehouse.id} value={warehouse.name}>
                          {warehouse.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}

            <div className="space-y-2">
              <Label htmlFor="product">Məhsul əlavə et</Label>
              <Select value={currentProduct} onValueChange={setCurrentProduct}>
                <SelectTrigger>
                  <SelectValue placeholder="Məhsul seçin" />
                </SelectTrigger>
                <SelectContent>
                  {products.map((product) => (
                    <SelectItem key={product.id} value={product.id}>
                      {product.name} ({product.article})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {currentProduct && (
              <div className="space-y-4">
                 <div className="space-y-2">
                   <Label>Paket miqdarı (hər paketdə olan məhsulun miqdarı)</Label>
                   <div className="flex gap-2">
                    <Popover open={packagingOpen} onOpenChange={setPackagingOpen}>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          role="combobox"
                          aria-expanded={packagingOpen}
                          className="flex-1 justify-between"
                        >
                           {currentPackagingType
                             ? `Hər paketdə ${currentPackagingType} metr`
                             : "Paket miqdarını seçin"}
                           <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-full p-0">
                        <Command>
                           <CommandInput 
                             placeholder="Paket miqdarını axtarın və ya yeni əlavə edin..." 
                             value={customPackaging}
                            onValueChange={setCustomPackaging}
                            onKeyDown={(e) => {
                              if (e.key === "Enter" && customPackaging.trim()) {
                                e.preventDefault();
                                handleAddCustomPackaging();
                              }
                            }}
                          />
                          <CommandList>
                            <CommandEmpty>
                              <div className="text-center py-2">
                                <p className="text-sm text-muted-foreground mb-2">
                                  Nəticə tapılmadı
                                </p>
                                {customPackaging.trim() && (
                                  <Button 
                                    size="sm" 
                                    onClick={handleAddCustomPackaging}
                                    className="text-xs"
                                  >
                                    "{customPackaging}" əlavə et
                                  </Button>
                                )}
                              </div>
                            </CommandEmpty>
                            <CommandGroup>
                              {packagingOptions
                                .filter((option) =>
                                  option.toLowerCase().includes(customPackaging.toLowerCase())
                                )
                                .map((option) => (
                                  <CommandItem
                                    key={option}
                                    value={option}
                                    onSelect={(currentValue) => {
                                      setCurrentPackagingType(currentValue);
                                      setPackagingOpen(false);
                                    }}
                                  >
                                    <Check
                                      className={cn(
                                        "mr-2 h-4 w-4",
                                        currentPackagingType === option ? "opacity-100" : "opacity-0"
                                      )}
                                    />
                                    {option} metr
                                  </CommandItem>
                                ))}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                    <div className="flex flex-col gap-2">
                       <Select value={currentPackagingMethod} onValueChange={setCurrentPackagingMethod}>
                         <SelectTrigger className="w-40">
                           <SelectValue placeholder="Paketləşdirmə üsulu" />
                         </SelectTrigger>
                        <SelectContent>
                          {packagingMethods.map((method) => (
                            <SelectItem key={method} value={method}>
                              {method}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <div className="flex gap-1">
                        <Input
                          id="new-packaging-method-input"
                          placeholder="Yeni üsul"
                          value={customPackagingMethod}
                          onChange={(e) => setCustomPackagingMethod(e.target.value)}
                          className="text-xs h-8 flex-1"
                          aria-label="Yeni paketləşdirmə üsulu"
                          onKeyDown={(e) => {
                            if (e.key === "Enter" && customPackagingMethod.trim()) {
                              e.preventDefault();
                              handleAddCustomPackagingMethod();
                            }
                          }}
                        />
                        <Button 
                          size="sm" 
                          onClick={handleAddCustomPackagingMethod}
                          disabled={!customPackagingMethod.trim()}
                          className="h-8 px-2"
                          aria-label="Yeni paketləşdirmə üsulunu əlavə et"
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                    <Input
                      id="package-count-input"
                      type="number"
                      placeholder="Sayı"
                      value={currentPackageCount}
                      onChange={(e) => setCurrentPackageCount(e.target.value)}
                      className="w-20"
                      aria-label="Paket sayı"
                    />
                    <Button 
                      onClick={handleAddPackaging} 
                      disabled={!currentPackagingType || !currentPackageCount || !currentPackagingMethod}
                      aria-label="Paketləşdirməni əlavə et"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {currentPackaging.length > 0 && (
                 <div className="space-y-2">
                   <Label>Seçilmiş {currentPackaging.length > 0 && currentPackaging[0].method ? currentPackaging[0].method + 'lar' : 'paketləşdirmələr'}</Label>
                   <div className="space-y-2 max-h-32 overflow-y-auto">
                        {currentPackaging.map((item, index) => {
                          const quantityPerPackage = parseInt(item.type.toString().split(/[+()]/)[0]);
                          const totalQuantity = quantityPerPackage * item.count;
                          return (
                            <div key={`packaging-${item.type}-${item.count}-${index}`} className="flex items-center justify-between bg-muted p-2 rounded">
                              <div className="flex flex-col">
                                <span className="text-sm font-medium">
                                  {item.count} ədəd paket × {item.type} metr ({item.method})
                                </span>
                                <span className="text-xs text-muted-foreground">
                                  Ümumi məhsul: {totalQuantity} metr
                                </span>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleRemovePackaging(index)}
                                className="h-6 w-6 p-0"
                                aria-label={`${item.type} paketini sil`}
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            </div>
                          );
                        })}
                    </div>
                     <div className="text-sm font-medium text-primary bg-primary/10 p-2 rounded">
                       Ümumi məhsul miqdarı: {getCurrentProductTotalQuantity()} metr
                     </div>
                  </div>
                )}

                {currentPackaging.length > 0 && (
                  <Button onClick={handleAddProduct} className="w-full">
                    <Plus className="mr-2 h-4 w-4" />
                    Məhsulu siyahıya əlavə et
                  </Button>
                )}
              </div>
            )}

            {selectedProducts.length > 0 && (
              <div className="space-y-2">
                <Label>Əlavə edilmiş məhsullar</Label>
                <div className="space-y-3 max-h-40 overflow-y-auto">
                   {selectedProducts.map((productEntry, index) => (
                    <div key={`selected-product-${productEntry.productId}-${index}`} className="border p-3 rounded bg-muted/50">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-sm">
                          {getProductName(productEntry.productId)}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveProduct(index)}
                          className="h-6 w-6 p-0"
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                      <div className="space-y-1">
                          {productEntry.packaging.map((pkg, pkgIndex) => (
                          <div key={`product-packaging-${pkg.type}-${pkg.count}-${pkgIndex}`} className="text-xs text-muted-foreground">
                            {pkg.count} ədəd × {pkg.type} metr ({pkg.method})
                          </div>
                        ))}
                        <div className="text-xs font-medium">
                          Ümumi: {getProductTotalQuantity(productEntry.packaging)} metr
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="notes">Qeydlər</Label>
              <Textarea
                id="notes"
                placeholder="Əlavə qeydlər (ixtiyari)"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label>Əməliyyat tarixi və saatı</Label>
              <DateTimePicker
                value={operationDateTime}
                onChange={setOperationDateTime}
                placeholder="Tarix və saat seçin"
              />
            </div>

            <div className="flex gap-2 pt-4">
              <Button 
                className="flex-1" 
                disabled={!operationType || selectedProducts.length === 0}
                onClick={handleSaveOperation}
                title={!operationType ? "Əməliyyat növünü seçin" : selectedProducts.length === 0 ? "Ən azı bir məhsul əlavə edin" : "Əməliyyatı saxla"}
              >
                <Save className="mr-2 h-4 w-4" />
                Əməliyyatı saxla
              </Button>
              
              {selectedProducts.length > 0 && (
                <>
                  <Button 
                    type="button" 
                    variant="outline"
                    onClick={() => {
                      const operationTitle = `${operationType} əməliyyatı`;
                      const operationDate = new Date().toLocaleDateString('az-AZ');
                      const productName = selectedProducts.map(p => getProductName(p.productId)).join(', ');
                      const totalQuantity = selectedProducts.reduce((total, p) => total + getProductTotalQuantity(p.packaging), 0);
                      handleDownloadPDF(operationTitle, operationDate, productName, totalQuantity);
                    }}
                    title="PDF formatında yüklə"
                  >
                    <Download className="mr-2 h-4 w-4" />
                    PDF İxrac
                  </Button>
                  
                  <Button 
                    type="button" 
                    variant="secondary"
                    onClick={() => {
                      const operationTitle = `${operationType} əməliyyatı`;
                      const operationDate = new Date().toLocaleDateString('az-AZ');
                      const productName = selectedProducts.map(p => getProductName(p.productId)).join(', ');
                      const totalQuantity = selectedProducts.reduce((total, p) => total + getProductTotalQuantity(p.packaging), 0);
                      handlePrint(operationTitle, operationDate, productName, totalQuantity);
                    }}
                    title="Çap et"
                  >
                    Print
                  </Button>
                </>
              )}
              
              <Button 
                variant="outline" 
                onClick={() => {
                  setSelectedProducts([]);
                  setCurrentProduct("");
                  setCurrentPackaging([]);
                  setNotes("");
                  setOperationType("");
                  setSelectedWarehouse("");
                  setSelectedDestinationWarehouse("");
                  setBatchName("");
                  setOperationDateTime(new Date());
                }}
                title="Bütün sahələri təmizlə"
              >
                Təmizlə
              </Button>
            </div>
          </CardContent>
        </Card>

      </div>

        <Card>
          <CardHeader>
            <CardTitle>Son Əməliyyatlar</CardTitle>
          </CardHeader>
          <CardContent>
            {operations.length > 0 ? (
              <div className="space-y-3 max-h-60 overflow-y-auto">
                {operations.slice(0, 5).map((operation) => (
                  <div key={operation.id} className="flex items-center justify-between py-2 border-b last:border-b-0">
                    <div className="flex items-center gap-3">
                      <OperationIcon type={operation.type} />
                      <div>
                        <p className="font-medium text-sm">{operation.productName}</p>
                        <p className="text-xs text-muted-foreground">
                          {operation.type} • {operation.warehouse} • {formatTimestamp(operation.timestamp)}
                        </p>
                      </div>
                    </div>
                    <span className={`font-medium text-sm ${getOperationColor(operation.type)}`}>
                      {operation.quantity} ədəd
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <p>Hələ ki heç bir əməliyyat yoxdur</p>
              </div>
            )}
          </CardContent>
        </Card>
    </div>
  );
}