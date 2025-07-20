import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Save } from "lucide-react";
import { useProductStore } from "@/lib/productStore";

export default function AddOperation() {
  const { products } = useProductStore();
  const [operationType, setOperationType] = useState("");
  const [selectedProduct, setSelectedProduct] = useState("");
  const [packagingType, setPackagingType] = useState("");
  const [packageCount, setPackageCount] = useState("");
  const [totalQuantity, setTotalQuantity] = useState("");
  const [notes, setNotes] = useState("");

  const selectedProductData = products.find(p => p.id === selectedProduct);

  const handlePackagingChange = (packaging: string, count: string) => {
    const packagingSize = parseInt(packaging);
    const countNum = parseInt(count);
    
    if (!isNaN(packagingSize) && !isNaN(countNum)) {
      setTotalQuantity((packagingSize * countNum).toString());
    } else {
      setTotalQuantity("");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Yeni Əməliyyat</h1>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
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
                  <SelectItem value="incoming">Daxil olma</SelectItem>
                  <SelectItem value="outgoing">Çıxış</SelectItem>
                  <SelectItem value="sale">Satış</SelectItem>
                  <SelectItem value="return">Geri qaytarma</SelectItem>
                  <SelectItem value="adjustment">Düzəliş</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="product">Məhsul</Label>
              <Select value={selectedProduct} onValueChange={setSelectedProduct}>
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

            {selectedProduct && (
              <div className="space-y-2">
                <Label htmlFor="packaging">Paketləşdirmə növü</Label>
                <Select value={packagingType} onValueChange={(value) => {
                  setPackagingType(value);
                  handlePackagingChange(value, packageCount);
                }}>
                  <SelectTrigger>
                    <SelectValue placeholder="Paketləşdirmə seçin" />
                  </SelectTrigger>
                  <SelectContent>
                    {selectedProductData?.packaging.map((pkg) => (
                      <SelectItem key={pkg} value={pkg}>
                        {pkg} metr
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {packagingType && (
              <div className="space-y-2">
                <Label htmlFor="package-count">Paket sayı</Label>
                <Input
                  id="package-count"
                  type="number"
                  placeholder="Paket sayını daxil edin"
                  value={packageCount}
                  onChange={(e) => {
                    setPackageCount(e.target.value);
                    handlePackagingChange(packagingType, e.target.value);
                  }}
                />
              </div>
            )}

            {totalQuantity && (
              <div className="space-y-2">
                <Label htmlFor="total-quantity">Ümumi miqdar</Label>
                <Input
                  id="total-quantity"
                  type="number"
                  placeholder="Ümumi miqdarı"
                  value={totalQuantity}
                  readOnly
                  className="bg-muted"
                />
                <div className="text-sm text-muted-foreground">
                  {packageCount} ədəd × {packagingType} metr = {totalQuantity} metr
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

            <div className="flex gap-2 pt-4">
              <Button className="flex-1">
                <Save className="mr-2 h-4 w-4" />
                Yadda saxla
              </Button>
              <Button variant="outline" className="flex-1">
                Təmizlə
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Tez Əməliyyatlar</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="text-sm text-muted-foreground mb-4">
              Tez-tez istifadə olunan əməliyyatlar:
            </div>

            <Button variant="outline" className="w-full justify-start">
              <Plus className="mr-2 h-4 w-4" />
              Albalı 1 - Daxil olma
            </Button>

            <Button variant="outline" className="w-full justify-start">
              <Plus className="mr-2 h-4 w-4" />
              Mango 2 - Satış
            </Button>

            <Button variant="outline" className="w-full justify-start">
              <Plus className="mr-2 h-4 w-4" />
              Qarağat 3 - Daxil olma
            </Button>

            <div className="pt-4 border-t">
              <h4 className="font-medium mb-2">Şablondan istifadə et:</h4>
              <Button variant="secondary" className="w-full">
                Qəbul Şablonu
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
          <div className="space-y-3">
            <div className="flex items-center justify-between py-2 border-b">
              <div>
                <p className="font-medium">Albalı 3 - Daxil olma</p>
                <p className="text-sm text-muted-foreground">Bugün, 14:30 - Miqdar: 25</p>
              </div>
              <span className="text-success font-medium">Uğurla</span>
            </div>
            
            <div className="flex items-center justify-between py-2 border-b">
              <div>
                <p className="font-medium">Mango 2 - Satış</p>
                <p className="text-sm text-muted-foreground">Bugün, 11:15 - Miqdar: 12</p>
              </div>
              <span className="text-success font-medium">Uğurla</span>
            </div>
            
            <div className="flex items-center justify-between py-2 border-b">
              <div>
                <p className="font-medium">Qarağat 1 - Daxil olma</p>
                <p className="text-sm text-muted-foreground">Dünən, 16:45 - Miqdar: 40</p>
              </div>
              <span className="text-success font-medium">Uğurla</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}