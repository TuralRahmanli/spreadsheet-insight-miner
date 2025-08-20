import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { X } from "lucide-react";
import { Product } from "@/types";
import { usePackagingStore } from "@/lib/packagingStore";
import { useWarehouseStore } from "@/lib/warehouseStore";

interface Filters {
  status: string;
  category: string;
  location: string;
  roll: string;
  stockRange: { min: string; max: string };
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
  const { packagingOptions } = usePackagingStore();
  const { warehouses } = useWarehouseStore();
  const allStatuses = ["all", "active", "out_of_stock", "low_stock"];
  const allLocations = ["all", ...warehouses.map(w => w.name)];
  const allRolls = ["all", ...packagingOptions];

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
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
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
            <label className="text-sm font-medium">Yerləşmə</label>
            <Select value={filters.location} onValueChange={(value) => 
              onFiltersChange({ ...filters, location: value })
            }>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {allLocations.map(location => (
                  <SelectItem key={location} value={location}>
                    {location === "all" ? "Hamısı" : location}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Rulon</label>
            <Select value={filters.roll} onValueChange={(value) => 
              onFiltersChange({ ...filters, roll: value })
            }>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {allRolls.map(roll => (
                  <SelectItem key={roll} value={roll}>
                    {roll === "all" ? "Hamısı" : roll}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Qalıqlar</label>
            <div className="flex gap-2">
              <Input
                type="number"
                placeholder="Min"
                value={filters.stockRange.min}
                onChange={(e) => 
                  onFiltersChange({ 
                    ...filters, 
                    stockRange: { ...filters.stockRange, min: e.target.value } 
                  })
                }
                className="text-sm"
                aria-label="Minimum qalıq"
              />
              <Input
                type="number"
                placeholder="Max"
                value={filters.stockRange.max}
                onChange={(e) => 
                  onFiltersChange({ 
                    ...filters, 
                    stockRange: { ...filters.stockRange, max: e.target.value } 
                  })
                }
                className="text-sm"
                aria-label="Maksimum qalıq"
              />
            </div>
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
              {filters.location !== "all" && (
                <Badge variant="secondary" className="gap-1">
                  Yerləşmə: {filters.location}
                  <X 
                    className="h-3 w-3 cursor-pointer" 
                    onClick={() => onFiltersChange({ ...filters, location: "all" })}
                  />
                </Badge>
              )}
              {filters.roll !== "all" && (
                <Badge variant="secondary" className="gap-1">
                  Rulon: {filters.roll}
                  <X 
                    className="h-3 w-3 cursor-pointer" 
                    onClick={() => onFiltersChange({ ...filters, roll: "all" })}
                  />
                </Badge>
              )}
              {(filters.stockRange.min !== "" || filters.stockRange.max !== "") && (
                <Badge variant="secondary" className="gap-1">
                  Qalıqlar: {filters.stockRange.min || "0"}-{filters.stockRange.max || "∞"}
                  <X 
                    className="h-3 w-3 cursor-pointer" 
                    onClick={() => onFiltersChange({ 
                      ...filters, 
                      stockRange: { min: "", max: "" } 
                    })}
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