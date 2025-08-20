import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { X, ChevronDown } from "lucide-react";
import { Product } from "@/types";

interface Filters {
  status: string[];
  category: string[];
  location: string[];
  roll: string[];
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
  const allStatuses = [
    { value: "active", label: "Mövcud" },
    { value: "out_of_stock", label: "Bitib" },
    { value: "low_stock", label: "Az qalıb" }
  ];
  
  const allLocations = Array.from(new Set(products.flatMap(p => p.warehouses).filter(Boolean)));
  const allRolls: string[] = []; // Placeholder - roll property doesn't exist in Product type yet
  
  const handleFilterChange = (filterType: keyof Filters, value: any) => {
    onFiltersChange({ ...filters, [filterType]: value });
  };

  const handleMultiSelectChange = (filterType: 'status' | 'category' | 'location' | 'roll', value: string) => {
    const currentValues = filters[filterType];
    let newValues;
    
    if (currentValues.includes(value)) {
      newValues = currentValues.filter(v => v !== value);
    } else {
      newValues = [...currentValues, value];
    }
    
    handleFilterChange(filterType, newValues);
  };

  const FilterDropdown = ({ 
    label, 
    filterKey, 
    options, 
    type = 'multiselect' 
  }: { 
    label: string; 
    filterKey: keyof Filters; 
    options: Array<{value: string, label: string}>; 
    type?: 'multiselect' | 'range' 
  }) => {
    if (type === 'range') {
      return (
        <Popover>
          <PopoverTrigger asChild>
            <Button 
              variant="outline" 
              className="w-full justify-between text-left font-normal"
            >
              <span>{label}</span>
              <ChevronDown className="h-4 w-4 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80">
            <div className="space-y-4">
              <h4 className="font-medium">{label}</h4>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-sm text-muted-foreground">Min</label>
                  <Input
                    type="number"
                    placeholder="0"
                    value={filters.stockRange.min || ''}
                    onChange={(e) => handleFilterChange('stockRange', {
                      ...filters.stockRange,
                      min: e.target.value ? Number(e.target.value) : undefined
                    })}
                  />
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">Max</label>
                  <Input
                    type="number"
                    placeholder="∞"
                    value={filters.stockRange.max || ''}
                    onChange={(e) => handleFilterChange('stockRange', {
                      ...filters.stockRange,
                      max: e.target.value ? Number(e.target.value) : undefined
                    })}
                  />
                </div>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      );
    }

    const selectedCount = (filters[filterKey] as string[]).length;
    
    return (
      <Popover>
        <PopoverTrigger asChild>
          <Button 
            variant="outline" 
            className="w-full justify-between text-left font-normal"
          >
            <span>{label} {selectedCount > 0 && `(${selectedCount})`}</span>
            <ChevronDown className="h-4 w-4 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-56">
          <div className="space-y-2">
            <h4 className="font-medium">{label}</h4>
            {options.map((option) => {
              const isSelected = (filters[filterKey] as string[]).includes(option.value);
              return (
                <div key={option.value} className="flex items-center space-x-2">
                  <Checkbox
                    id={`${filterKey}-${option.value}`}
                    checked={isSelected}
                    onCheckedChange={() => handleMultiSelectChange(filterKey as any, option.value)}
                  />
                  <label 
                    htmlFor={`${filterKey}-${option.value}`}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                  >
                    {option.label}
                  </label>
                </div>
              );
            })}
          </div>
        </PopoverContent>
      </Popover>
    );
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
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          <FilterDropdown
            label="Kateqoriya"
            filterKey="category"
            options={categories.filter(c => c !== "all").map(c => ({ value: c, label: c }))}
          />
          
          <FilterDropdown
            label="Status"
            filterKey="status"
            options={allStatuses}
          />
          
          <FilterDropdown
            label="Yerləşmə"
            filterKey="location"
            options={allLocations.map(l => ({ value: l, label: l }))}
          />
          
          <FilterDropdown
            label="Rulon"
            filterKey="roll"
            options={allRolls.map(r => ({ value: r, label: r }))}
          />
          
          <FilterDropdown
            label="Qalıqlar"
            filterKey="stockRange"
            options={[]}
            type="range"
          />
        </div>

        {/* Active Filters Display */}
        {hasActiveFilters && (
          <div className="mt-4 space-y-2">
            <label className="text-sm font-medium">Aktiv filtrlər:</label>
            <div className="flex flex-wrap gap-2">
              {filters.category.map((category) => (
                <Badge key={category} variant="secondary" className="gap-1">
                  Kateqoriya: {category}
                  <X 
                    className="h-3 w-3 cursor-pointer" 
                    onClick={() => handleMultiSelectChange('category', category)}
                  />
                </Badge>
              ))}
              
              {filters.status.map((status) => (
                <Badge key={status} variant="secondary" className="gap-1">
                  Status: {allStatuses.find(s => s.value === status)?.label}
                  <X 
                    className="h-3 w-3 cursor-pointer" 
                    onClick={() => handleMultiSelectChange('status', status)}
                  />
                </Badge>
              ))}
              
              {filters.location.map((location) => (
                <Badge key={location} variant="secondary" className="gap-1">
                  Yerləşmə: {location}
                  <X 
                    className="h-3 w-3 cursor-pointer" 
                    onClick={() => handleMultiSelectChange('location', location)}
                  />
                </Badge>
              ))}
              
              {filters.roll.map((roll) => (
                <Badge key={roll} variant="secondary" className="gap-1">
                  Rulon: {roll}
                  <X 
                    className="h-3 w-3 cursor-pointer" 
                    onClick={() => handleMultiSelectChange('roll', roll)}
                  />
                </Badge>
              ))}
              
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