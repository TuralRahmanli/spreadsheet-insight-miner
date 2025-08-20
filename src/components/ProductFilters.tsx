import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { X } from "lucide-react";
import { Product } from "@/types";
import { usePackagingMethodsStore } from "@/lib/packagingMethodsStore";

interface Filters {
  status: string;
  category: string;
  location: string;
  roll: string;
  stockRange: { min: number | undefined; max: number | undefined };
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
  const { packagingMethods } = usePackagingMethodsStore();
  
  const allStatuses = [
    { value: "active", label: "Mövcud" },
    { value: "out_of_stock", label: "Bitib" },
    { value: "low_stock", label: "Az qalıb" }
  ];
  
  const allLocations = Array.from(new Set(products.flatMap(p => p.warehouses).filter(Boolean)));
  
  const handleFilterChange = (filterType: keyof Filters, value: any) => {
    onFiltersChange({ ...filters, [filterType]: value });
  };

  const StockRangeFilter = () => (
    <div className="space-y-2">
      <label className="text-sm font-medium">Qalıqlar</label>
      <div className="grid grid-cols-2 gap-2">
        <Input
          type="number"
          placeholder="Min"
          value={filters.stockRange.min || ''}
          onChange={(e) => handleFilterChange('stockRange', {
            ...filters.stockRange,
            min: e.target.value ? Number(e.target.value) : undefined
          })}
        />
        <Input
          type="number"
          placeholder="Max"
          value={filters.stockRange.max || ''}
          onChange={(e) => handleFilterChange('stockRange', {
            ...filters.stockRange,
            max: e.target.value ? Number(e.target.value) : undefined
          })}
        />
      </div>
    </div>
  );

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
            <Select value={filters.category} onValueChange={(value) => handleFilterChange('category', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Seçin..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Hamısı</SelectItem>
                {categories.filter(c => c !== "all").map((category) => (
                  <SelectItem key={category} value={category}>{category}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Status</label>
            <Select value={filters.status} onValueChange={(value) => handleFilterChange('status', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Seçin..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Hamısı</SelectItem>
                {allStatuses.map((status) => (
                  <SelectItem key={status.value} value={status.value}>{status.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Yerləşmə</label>
            <Select value={filters.location} onValueChange={(value) => handleFilterChange('location', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Seçin..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Hamısı</SelectItem>
                {allLocations.map((location) => (
                  <SelectItem key={location} value={location}>{location}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Rulon</label>
            <Select value={filters.roll} onValueChange={(value) => handleFilterChange('roll', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Seçin..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Hamısı</SelectItem>
                {packagingMethods.map((method) => (
                  <SelectItem key={method} value={method}>{method}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="mt-4">
          <StockRangeFilter />
        </div>

        {/* Active Filters Display */}
        {hasActiveFilters && (
          <div className="mt-4 space-y-2">
            <label className="text-sm font-medium">Aktiv filtrlər:</label>
            <div className="flex flex-wrap gap-2">
              {filters.category && (
                <Badge variant="secondary" className="gap-1">
                  Kateqoriya: {filters.category}
                  <X 
                    className="h-3 w-3 cursor-pointer" 
                    onClick={() => handleFilterChange('category', '')}
                  />
                </Badge>
              )}
              
              {filters.status && (
                <Badge variant="secondary" className="gap-1">
                  Status: {allStatuses.find(s => s.value === filters.status)?.label}
                  <X 
                    className="h-3 w-3 cursor-pointer" 
                    onClick={() => handleFilterChange('status', '')}
                  />
                </Badge>
              )}
              
              {filters.location && (
                <Badge variant="secondary" className="gap-1">
                  Yerləşmə: {filters.location}
                  <X 
                    className="h-3 w-3 cursor-pointer" 
                    onClick={() => handleFilterChange('location', '')}
                  />
                </Badge>
              )}
              
              {filters.roll && (
                <Badge variant="secondary" className="gap-1">
                  Rulon: {filters.roll}
                  <X 
                    className="h-3 w-3 cursor-pointer" 
                    onClick={() => handleFilterChange('roll', '')}
                  />
                </Badge>
              )}
              
              {(filters.stockRange.min !== undefined || filters.stockRange.max !== undefined) && (
                <Badge variant="secondary" className="gap-1">
                  Qalıqlar: {filters.stockRange.min || 0} - {filters.stockRange.max || '∞'}
                  <X 
                    className="h-3 w-3 cursor-pointer" 
                    onClick={() => handleFilterChange('stockRange', { min: undefined, max: undefined })}
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