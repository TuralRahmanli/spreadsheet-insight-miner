import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, Plus, Edit, Trash2, Package } from "lucide-react";

const products = [
  {
    id: "ALB-001",
    article: "ALB-001",
    name: "Albalı Məhsulu Tip 1",
    category: "Albalı",
    status: "active",
    price: 25.50,
    stock: 150,
    description: "Premium keyfiyyətli albalı məhsulu"
  },
  {
    id: "ALB-002", 
    article: "ALB-002",
    name: "Albalı Məhsulu Tip 2",
    category: "Albalı",
    status: "active",
    price: 22.30,
    stock: 200,
    description: "Standart keyfiyyətli albalı məhsulu"
  },
  {
    id: "ALB-003",
    article: "ALB-003", 
    name: "Albalı Məhsulu Tip 3",
    category: "Albalı",
    status: "active",
    price: 28.75,
    stock: 80,
    description: "Deluxe keyfiyyətli albalı məhsulu"
  },
  {
    id: "QAR-001",
    article: "QAR-001",
    name: "Qarağat Məhsulu Tip 1", 
    category: "Qarağat",
    status: "active",
    price: 32.20,
    stock: 120,
    description: "Premium keyfiyyətli qarağat məhsulu"
  },
  {
    id: "QAR-002",
    article: "QAR-002",
    name: "Qarağat Məhsulu Tip 2",
    category: "Qarağat", 
    status: "low_stock",
    price: 29.90,
    stock: 45,
    description: "Standart keyfiyyətli qarağat məhsulu"
  },
  {
    id: "MNG-001",
    article: "MNG-001",
    name: "Mango Məhsulu Tip 1",
    category: "Mango",
    status: "active",
    price: 35.60,
    stock: 90,
    description: "Premium keyfiyyətli mango məhsulu"
  },
  {
    id: "MNG-002",
    article: "MNG-002", 
    name: "Mango Məhsulu Tip 2",
    category: "Mango",
    status: "active",
    price: 31.40,
    stock: 110,
    description: "Standart keyfiyyətli mango məhsulu"
  },
  {
    id: "MNG-003",
    article: "MNG-003",
    name: "Mango Məhsulu Tip 3",
    category: "Mango",
    status: "out_of_stock",
    price: 38.90,
    stock: 0,
    description: "Lux keyfiyyətli mango məhsulu"
  },
  {
    id: "ZEY-001",
    article: "ZEY-001",
    name: "Zeytun Məhsulu Tip 1",
    category: "Zeytun",
    status: "active", 
    price: 42.30,
    stock: 75,
    description: "Premium keyfiyyətli zeytun məhsulu"
  },
  {
    id: "ZEY-002",
    article: "ZEY-002",
    name: "Zeytun Məhsulu Tip 2",
    category: "Zeytun",
    status: "active",
    price: 38.50,
    stock: 95,
    description: "Standart keyfiyyətli zeytun məhsulu"
  }
];

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
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  
  const categories = ["all", ...Array.from(new Set(products.map(p => p.category)))];
  
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.article.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Məhsullar</h1>
          <p className="text-muted-foreground">Bütün məhsulların siyahısı və məlumatları</p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Yeni Məhsul
        </Button>
      </div>

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
                <TableHead>Qiymət</TableHead>
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
                  <TableCell>{product.price.toFixed(2)} ₼</TableCell>
                  <TableCell>{product.stock} ədəd</TableCell>
                  <TableCell>
                    {getStatusBadge(product.status, product.stock)}
                  </TableCell>
                  <TableCell className="max-w-xs truncate" title={product.description}>
                    {product.description}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Trash2 className="h-4 w-4" />
                      </Button>
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