import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { LoadingButton } from "@/components/LoadingButton";
import { useToast } from "@/hooks/use-toast";
import { useProductStore } from "@/lib/productStore";
import { sanitizeString, sanitizeNumber } from "@/lib/validation";
import { Product } from "@/types";
import { useFormValidation, commonValidationRules } from "@/hooks/useFormValidation";
import { FormValidation } from "@/components/FormValidation";

interface ProductDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  trigger?: React.ReactNode;
  editingProduct?: Product | null;
}

interface ProductFormData {
  article: string;
  name: string;
  category: string;
  stock: string;
  unit: string;
  description: string;
  packaging: {type: string, quantity: number}[];
}

export function ProductDialog({ isOpen, onOpenChange, trigger, editingProduct }: ProductDialogProps) {
  const { addProduct, updateProduct } = useProductStore();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  
  const [formData, setFormData] = useState<ProductFormData>({
    article: "",
    name: "",
    category: "",
    stock: "",
    unit: "",
    description: "",
    packaging: []
  });

  const [newPackageType, setNewPackageType] = useState("");
  const [newPackageQuantity, setNewPackageQuantity] = useState("");

  // Form validation rules
  const validationRules: { field: string; validate: (value: any, formData?: any) => string | null; required?: boolean }[] = [
    { field: 'article', validate: commonValidationRules.required, required: true },
    { field: 'name', validate: commonValidationRules.required, required: true },
    { field: 'stock', validate: (value: string) => {
      const num = parseFloat(value);
      return commonValidationRules.positiveNumber(num);
    }, required: false }
  ];

  const { errors, validateForm, clearErrors } = useFormValidation(validationRules);

  // Load editing product data
  useEffect(() => {
    if (editingProduct) {
      setFormData({
        article: editingProduct.article,
        name: editingProduct.name,
        category: editingProduct.category,
        stock: editingProduct.stock.toString(),
        unit: editingProduct.unit,
        description: editingProduct.description || "",
        packaging: editingProduct.packaging || []
      });
    } else {
      setFormData({
        article: "",
        name: "",
        category: "",
        stock: "",
        unit: "",
        description: "",
        packaging: []
      });
    }
    clearErrors();
    setNewPackageType("");
    setNewPackageQuantity("");
  }, [editingProduct, clearErrors]);

  const handleAddPackaging = () => {
    if (newPackageType && newPackageQuantity) {
      const quantity = parseInt(newPackageQuantity);
      if (!isNaN(quantity) && quantity > 0) {
        setFormData(prev => ({
          ...prev,
          packaging: [...prev.packaging, { type: newPackageType, quantity }]
        }));
        setNewPackageType("");
        setNewPackageQuantity("");
      }
    }
  };

  const handleRemovePackaging = (index: number) => {
    setFormData(prev => ({
      ...prev,
      packaging: prev.packaging.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async () => {
    if (!validateForm(formData)) {
      return;
    }

    setIsLoading(true);
    
    try {
      const sanitizedData = {
        article: sanitizeString(formData.article),
        name: sanitizeString(formData.name),
        category: sanitizeString(formData.category),
        stock: sanitizeNumber(formData.stock),
        unit: sanitizeString(formData.unit),
        description: sanitizeString(formData.description),
        packaging: formData.packaging
      };

      if (editingProduct) {
        // Update existing product
        updateProduct(editingProduct.id, sanitizedData);
        toast({
          title: "Uğur",
          description: "Məhsul uğurla yeniləndi"
        });
      } else {
        // Add new product
        const newProduct: Product = {
          id: sanitizedData.article,
          article: sanitizedData.article,
          name: sanitizedData.name,
          category: sanitizedData.category || "",
          status: "active",
          stock: sanitizedData.stock,
          unit: sanitizedData.unit || "",
          packaging: sanitizedData.packaging,
          warehouses: [],
          description: sanitizedData.description
        };

        addProduct(newProduct);
        toast({
          title: "Uğur",
          description: "Məhsul uğurla əlavə edildi"
        });
      }

      onOpenChange(false);
    } catch (error) {
      toast({
        title: "Xəta",
        description: "Məhsul saxlanılarkən xəta baş verdi",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {editingProduct ? "Məhsulu Redaktə Et" : "Yeni Məhsul Əlavə Et"}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="article">Artikul *</Label>
            <Input
              id="article"
              value={formData.article}
              onChange={(e) => setFormData(prev => ({ ...prev, article: e.target.value }))}
              placeholder="Məhsul artikulunu daxil edin"
              disabled={!!editingProduct} // Disable editing article for existing products
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="name">Məhsul Adı *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Məhsul adını daxil edin"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="category">Kateqoriya</Label>
            <Input
              id="category"
              value={formData.category}
              onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
              placeholder="Kateqoriya adını daxil edin"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="stock">Stok Miqdarı</Label>
            <Input
              id="stock"
              type="number"
              min="0"
              value={formData.stock}
              onChange={(e) => setFormData(prev => ({ ...prev, stock: e.target.value }))}
              placeholder="Stok miqdarını daxil edin"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="unit">Ölçü Vahidi</Label>
            <Input
              id="unit"
              value={formData.unit}
              onChange={(e) => setFormData(prev => ({ ...prev, unit: e.target.value }))}
              placeholder="kg, ədəd, litr, vs."
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Təsvir</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Məhsul haqqında əlavə məlumat"
              rows={3}
            />
          </div>
          
          <div className="space-y-2">
            <Label>Paket növləri</Label>
            <div className="flex gap-2">
              <Input
                placeholder="Paket növü (məs. 100)"
                value={newPackageType}
                onChange={(e) => setNewPackageType(e.target.value)}
                className="flex-1"
              />
              <Input
                type="number"
                placeholder="Miqdar"
                value={newPackageQuantity}
                onChange={(e) => setNewPackageQuantity(e.target.value)}
                className="w-24"
                min="1"
              />
              <Button
                type="button"
                onClick={handleAddPackaging}
                disabled={!newPackageType || !newPackageQuantity}
                size="sm"
              >
                Əlavə et
              </Button>
            </div>
            
            {formData.packaging.length > 0 && (
              <div className="space-y-1 max-h-32 overflow-y-auto">
                {formData.packaging.map((pack, index) => (
                  <div key={`${pack.type}-${pack.quantity}-${index}`} className="flex items-center justify-between bg-muted p-2 rounded text-sm">
                    <span>{pack.type}×{pack.quantity}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemovePackaging(index)}
                      className="h-6 w-6 p-0"
                    >
                      ×
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
              Ləğv et
            </Button>
            <LoadingButton onClick={handleSubmit} loading={isLoading}>
              {editingProduct ? "Yenilə" : "Məhsul Əlavə Et"}
            </LoadingButton>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}