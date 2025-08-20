import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";
import { Product } from "@/types";

interface Filters {
  status: string;
  stockLevel: string;
  unit: string;
  category: string;
}

interface ProductFiltersProps {
  filters: Filters;
  onFiltersChange: (filters: Filters) => void;
  categories: string[];
  products: Product[];
  hasActiveFilters: boolean;
  onClearFilters: () => void;
}

export function ProductFilters({ 
  filters, 
  onFiltersChange, 
  categories, 
  products, 
  hasActiveFilters, 
  onClearFilters 
}: ProductFiltersProps) {
  const allUnits = ["all", ...Array.from(new Set(products.map(p => p.unit).filter(Boolean)))];
  const stockLevels = ["all", "in_stock", "low_stock", "out_of_stock"];
  const allStatuses = ["all", "active", "out_of_stock", "low_stock"];

  const getStockLevelLabel = (level: string) => {
    switch (level) {
      case "in_stock": return "Stokda var";
      case "low_stock": return "Az qalıb";
      case "out_of_stock": return "Bitib";
      default: return "Hamısı";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "active": return "Mövcud";
      case "out_of_stock": return "Bitib";
      case "low_stock": return "Az qalıb";
      default: return "Hamısı";
    }
  };

  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">Filtrlər</CardTitle>
          {hasActiveFilters && (
            <Button variant="ghost" size="sm" onClick={onClearFilters}>
              <X className="mr-1 h-4 w-4" />
              Təmizlə
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Kateqoriya</label>
            <Select value={filters.category} onValueChange={(value) => 
              onFiltersChange({ ...filters, category: value })
            }>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {categories.map(category => (
                  <SelectItem key={category} value={category}>
                    {category === "all" ? "Hamısı" : category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Status</label>
            <Select value={filters.status} onValueChange={(value) => 
              onFiltersChange({ ...filters, status: value })
            }>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {allStatuses.map(status => (
                  <SelectItem key={status} value={status}>
                    {getStatusLabel(status)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Stok Səviyyəsi</label>
            <Select value={filters.stockLevel} onValueChange={(value) => 
              onFiltersChange({ ...filters, stockLevel: value })
            }>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {stockLevels.map(level => (
                  <SelectItem key={level} value={level}>
                    {getStockLevelLabel(level)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Ölçü Vahidi</label>
            <Select value={filters.unit} onValueChange={(value) => 
              onFiltersChange({ ...filters, unit: value })
            }>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {allUnits.map(unit => (
                  <SelectItem key={unit} value={unit}>
                    {unit === "all" ? "Hamısı" : unit}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Active Filters Display */}
        {hasActiveFilters && (
          <div className="mt-4 space-y-2">
            <label className="text-sm font-medium">Aktiv filtrlər:</label>
            <div className="flex flex-wrap gap-2">
              {filters.category !== "all" && (
                <Badge variant="secondary" className="gap-1">
                  Kateqoriya: {filters.category}
                  <X 
                    className="h-3 w-3 cursor-pointer" 
                    onClick={() => onFiltersChange({ ...filters, category: "all" })}
                  />
                </Badge>
              )}
              {filters.status !== "all" && (
                <Badge variant="secondary" className="gap-1">
                  Status: {getStatusLabel(filters.status)}
                  <X 
                    className="h-3 w-3 cursor-pointer" 
                    onClick={() => onFiltersChange({ ...filters, status: "all" })}
                  />
                </Badge>
              )}
              {filters.stockLevel !== "all" && (
                <Badge variant="secondary" className="gap-1">
                  Stok: {getStockLevelLabel(filters.stockLevel)}
                  <X 
                    className="h-3 w-3 cursor-pointer" 
                    onClick={() => onFiltersChange({ ...filters, stockLevel: "all" })}
                  />
                </Badge>
              )}
              {filters.unit !== "all" && (
                <Badge variant="secondary" className="gap-1">
                  Vahid: {filters.unit}
                  <X 
                    className="h-3 w-3 cursor-pointer" 
                    onClick={() => onFiltersChange({ ...filters, unit: "all" })}
                  />
                </Badge>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}