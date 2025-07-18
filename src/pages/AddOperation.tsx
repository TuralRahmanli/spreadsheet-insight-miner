import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Save } from "lucide-react";

const productOptions = [
  "Albalı 1", "Albalı 2", "Albalı 3", "Albalı 4", "Albalı 5", "Albalı 6", "Albalı 7", "Albalı 8", "Albalı 9",
  "Qarağat 1", "Qarağat 2", "Qarağat 3", "Qarağat 4",
  "Mango 1", "Mango 2", "Mango 3", "Mango 4", "Mango 5",
  "Zeytun 1"
];

export default function AddOperation() {
  const [operationType, setOperationType] = useState("");
  const [selectedProduct, setSelectedProduct] = useState("");
  const [quantity, setQuantity] = useState("");
  const [notes, setNotes] = useState("");

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
                  {productOptions.map((product) => (
                    <SelectItem key={product} value={product}>
                      {product}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="quantity">Miqdar</Label>
              <Input
                id="quantity"
                type="number"
                placeholder="Miqdarı daxil edin"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
              />
            </div>

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