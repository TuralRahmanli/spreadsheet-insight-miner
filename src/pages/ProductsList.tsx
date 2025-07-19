import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, Plus, Edit, Trash2, Package } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useProductStore } from "@/lib/productStore";

const getStatusBadge = (status: string, stock: number) => {
  if (status === "out_of_stock" || stock === 0) {
    return <Badge variant="destructive">Bitib</Badge>;
  }
  if (status === "low_stock" || stock < 50) {
    return <Badge variant="secondary" className="bg-warning text-warning-foreground">Az qalıb</Badge>;
  }
  return <Badge variant="secondary" className="bg-success text-success-foreground">Mövcud</Badge>;
};

export default function ProductsList() {
  const { products, addProduct, removeProduct, updateProduct } = useProductStore();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [newProduct, setNewProduct] = useState({
    article: "",
    name: "",
    category: "",
    stock: "",
    unit: "",
    packaging: "",
    description: ""
  });
  const { toast } = useToast();
  
  const categories = ["all", ...Array.from(new Set(products.map(p => p.category)))];
  
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.article.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleAddProduct = () => {
    if (!newProduct.article || !newProduct.name) {
      toast({
        title: "Xəta",
        description: "Artikul və Məhsul Adı sahələri məcburidir",
        variant: "destructive"
      });
      return;
    }

    const product = {
      id: newProduct.article,
      article: newProduct.article,
      name: newProduct.name,
      category: newProduct.category || "",
      status: "active",
      stock: parseInt(newProduct.stock) || 0,
      unit: newProduct.unit || "",
      packaging: newProduct.packaging || "",
      description: newProduct.description
    };

    addProduct(product);
    setNewProduct({
      article: "",
      name: "",
      category: "",
      stock: "",
      unit: "",
      packaging: "",
      description: ""
    });
    setIsDialogOpen(false);
    
    toast({
      title: "Uğur",
      description: "Məhsul uğurla əlavə edildi"
    });
  };

  const handleDeleteProduct = (productId: string) => {
    removeProduct(productId);
    toast({
      title: "Uğur", 
      description: "Məhsul uğurla silindi"
    });
  };

  const handleEditProduct = (product: any) => {
    setEditingProduct({
      article: product.article,
      name: product.name,
      category: product.category,
      stock: product.stock.toString(),
      description: product.description || ""
    });
    setIsEditDialogOpen(true);
  };

  const handleUpdateProduct = () => {
    if (!editingProduct?.article || !editingProduct?.name) {
      toast({
        title: "Xəta",
        description: "Artikul və Məhsul Adı sahələri məcburidir",
        variant: "destructive"
      });
      return;
    }

    const updates = {
      article: editingProduct.article,
      name: editingProduct.name,
      category: editingProduct.category || "",
      stock: parseInt(editingProduct.stock) || 0,
      description: editingProduct.description
    };

    // Find the original product to get its ID
    const originalProduct = products.find(p => p.article === editingProduct.article);
    if (originalProduct) {
      updateProduct(originalProduct.id, updates);
      setEditingProduct(null);
      setIsEditDialogOpen(false);
      
      toast({
        title: "Uğur",
        description: "Məhsul uğurla yeniləndi"
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Məhsullar</h1>
          <p className="text-muted-foreground">Bütün məhsulların siyahısı və məlumatları</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Yeni Məhsul
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Yeni Məhsul Əlavə Et</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="article">Artikul *</Label>
                <Input
                  id="article"
                  value={newProduct.article}
                  onChange={(e) => setNewProduct(prev => ({ ...prev, article: e.target.value }))}
                  placeholder="Məs: ALB-004"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="name">Məhsul Adı *</Label>
                <Input
                  id="name"
                  value={newProduct.name}
                  onChange={(e) => setNewProduct(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Məhsulun adını daxil edin"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="category">Kateqoriya</Label>
                <Input
                  id="category"
                  value={newProduct.category}
                  onChange={(e) => setNewProduct(prev => ({ ...prev, category: e.target.value }))}
                  placeholder="Məs: Albalı, Qarağat, Mango"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="stock">Stok</Label>
                <Input
                  id="stock"
                  type="number"
                  value={newProduct.stock}
                  onChange={(e) => setNewProduct(prev => ({ ...prev, stock: e.target.value }))}
                  placeholder="0"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="unit">Ölçü Vahidi</Label>
                <Select value={newProduct.unit} onValueChange={(value) => setNewProduct(prev => ({ ...prev, unit: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Ölçü vahidini seçin" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="kg">Kiloqram (kg)</SelectItem>
                    <SelectItem value="ədəd">Ədəd</SelectItem>
                    <SelectItem value="litr">Litr</SelectItem>
                    <SelectItem value="metr">Metr (m)</SelectItem>
                    <SelectItem value="sm">Santimetr (sm)</SelectItem>
                    <SelectItem value="qutu">Qutu</SelectItem>
                    <SelectItem value="paket">Paket</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="packaging">Paketləşdirmə Üsulu</Label>
                <Select value={newProduct.packaging} onValueChange={(value) => setNewProduct(prev => ({ ...prev, packaging: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Paketləşdirmə üsulunu seçin" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Plastik torba">Plastik torba</SelectItem>
                    <SelectItem value="Plastik qab">Plastik qab</SelectItem>
                    <SelectItem value="Şüşə qab">Şüşə qab</SelectItem>
                    <SelectItem value="Şüşə şüşə">Şüşə şüşə</SelectItem>
                    <SelectItem value="Plastik şüşə">Plastik şüşə</SelectItem>
                    <SelectItem value="Karton qutu">Karton qutu</SelectItem>
                    <SelectItem value="Metal qutu">Metal qutu</SelectItem>
                    <SelectItem value="Vakuum paket">Vakuum paket</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">Təsvir</Label>
                <Textarea
                  id="description"
                  value={newProduct.description}
                  onChange={(e) => setNewProduct(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Məhsul haqqında qısa məlumat"
                  rows={3}
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Ləğv et
              </Button>
              <Button onClick={handleAddProduct}>
                Əlavə et
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Edit Product Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Məhsulu Redaktə Et</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-article">Artikul *</Label>
              <Input
                id="edit-article"
                value={editingProduct?.article || ""}
                onChange={(e) => setEditingProduct(prev => ({ ...prev, article: e.target.value }))}
                placeholder="Məs: ALB-004"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-name">Məhsul Adı *</Label>
              <Input
                id="edit-name"
                value={editingProduct?.name || ""}
                onChange={(e) => setEditingProduct(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Məhsulun adını daxil edin"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-category">Kateqoriya</Label>
              <Input
                id="edit-category"
                value={editingProduct?.category || ""}
                onChange={(e) => setEditingProduct(prev => ({ ...prev, category: e.target.value }))}
                placeholder="Məs: Albalı, Qarağat, Mango"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-stock">Stok</Label>
              <Input
                id="edit-stock"
                type="number"
                value={editingProduct?.stock || ""}
                onChange={(e) => setEditingProduct(prev => ({ ...prev, stock: e.target.value }))}
                placeholder="0"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-description">Təsvir</Label>
              <Textarea
                id="edit-description"
                value={editingProduct?.description || ""}
                onChange={(e) => setEditingProduct(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Məhsul haqqında qısa məlumat"
                rows={3}
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Ləğv et
            </Button>
            <Button onClick={handleUpdateProduct}>
              Yadda saxla
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2 flex-1">
          <Search className="h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Məhsul adı və ya artikul axtar..." 
            className="max-w-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <select 
          className="px-3 py-2 border border-input bg-background rounded-md text-sm"
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
        >
          <option value="all">Bütün kateqoriyalar</option>
          {categories.filter(cat => cat !== "all").map(category => (
            <option key={category} value={category}>{category}</option>
          ))}
        </select>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Məhsullar Siyahısı ({filteredProducts.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Artikul</TableHead>
                <TableHead>Məhsul Adı</TableHead>
                <TableHead>Kateqoriya</TableHead>
                <TableHead>Stok</TableHead>
                <TableHead>Vəziyyət</TableHead>
                <TableHead>Təsvir</TableHead>
                <TableHead>Əməliyyatlar</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProducts.map((product) => (
                <TableRow key={product.id}>
                  <TableCell className="font-medium">{product.article}</TableCell>
                  <TableCell>{product.name}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{product.category}</Badge>
                  </TableCell>
                  <TableCell>{product.stock} {product.unit}</TableCell>
                  <TableCell>
                    {getStatusBadge(product.status, product.stock)}
                  </TableCell>
                  <TableCell className="max-w-xs truncate" title={product.description}>
                    {product.description}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8"
                        onClick={() => handleEditProduct(product)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 hover:bg-destructive/10 hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Məhsulu sil</AlertDialogTitle>
                            <AlertDialogDescription>
                              Bu məhsulu silmək istədiyinizə əminsiniz? Bu əməliyyat geri qaytarıla bilməz.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Ləğv et</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDeleteProduct(product.id)}>
                              Sil
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}