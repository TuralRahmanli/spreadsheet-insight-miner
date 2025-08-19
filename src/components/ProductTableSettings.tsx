import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Settings } from "lucide-react";

interface ProductTableSettingsProps {
  columnLabels: Record<string, string>;
  columnVisibility: Record<string, boolean>;
  onColumnVisibilityChange: (visibility: Record<string, boolean>) => void;
}

export function ProductTableSettings({ 
  columnLabels, 
  columnVisibility, 
  onColumnVisibilityChange 
}: ProductTableSettingsProps) {
  const handleColumnToggle = (key: string, checked: boolean) => {
    onColumnVisibilityChange({ ...columnVisibility, [key]: checked });
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm">
          <Settings className="mr-2 h-4 w-4" />
          Sütunlar
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <div className="space-y-4">
          <h4 className="font-medium leading-none">Sütun Görünümü</h4>
          <div className="grid grid-cols-2 gap-2 max-h-60 overflow-y-auto">
            {Object.entries(columnLabels).map(([key, label]) => (
              <div key={key} className="flex items-center space-x-2">
                <Checkbox
                  id={key}
                  checked={columnVisibility[key]}
                  onCheckedChange={(checked) => handleColumnToggle(key, !!checked)}
                />
                <Label htmlFor={key} className="text-sm truncate" title={label}>
                  {label}
                </Label>
              </div>
            ))}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}