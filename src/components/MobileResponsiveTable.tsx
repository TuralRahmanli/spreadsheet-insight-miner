import { ReactNode } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";

interface MobileResponsiveTableProps {
  data: any[];
  columns: {
    key: string;
    label: string;
    render?: (item: any) => ReactNode;
    mobileOrder?: number;
  }[];
  onEdit?: (item: any) => void;
  onDelete?: (item: any) => void;
}

export const MobileResponsiveTable = ({ 
  data, 
  columns, 
  onEdit, 
  onDelete 
}: MobileResponsiveTableProps) => {
  const isMobile = useIsMobile();

  if (!isMobile) {
    // Render normal table for desktop
    return (
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b">
              {columns.map(col => (
                <th key={col.key} className="text-left p-2 font-medium">
                  {col.label}
                </th>
              ))}
              {(onEdit || onDelete) && <th className="text-left p-2 font-medium">Əməliyyatlar</th>}
            </tr>
          </thead>
          <tbody>
            {data.map((item, index) => (
              <tr key={index} className="border-b">
                {columns.map(col => (
                  <td key={col.key} className="p-2">
                    {col.render ? col.render(item) : item[col.key]}
                  </td>
                ))}
                {(onEdit || onDelete) && (
                  <td className="p-2">
                    <div className="flex gap-1">
                      {onEdit && (
                        <Button size="sm" variant="ghost" onClick={() => onEdit(item)}>
                          Redaktə
                        </Button>
                      )}
                      {onDelete && (
                        <Button size="sm" variant="ghost" onClick={() => onDelete(item)}>
                          Sil
                        </Button>
                      )}
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  // Mobile card view
  return (
    <div className="space-y-4">
      {data.map((item, index) => (
        <Card key={index}>
          <CardContent className="p-4">
            <div className="space-y-2">
              {columns
                .sort((a, b) => (a.mobileOrder || 0) - (b.mobileOrder || 0))
                .slice(0, 4) // Show only first 4 most important columns on mobile
                .map(col => (
                  <div key={col.key} className="flex justify-between items-start gap-2 min-w-0">
                    <span className="text-sm text-muted-foreground flex-shrink-0">{col.label}:</span>
                    <span className="text-sm font-medium text-right flex-1 min-w-0">
                      {col.render ? col.render(item) : item[col.key]}
                    </span>
                  </div>
                ))}
              {(onEdit || onDelete) && (
                <div className="flex gap-2 mt-3 pt-3 border-t">
                  {onEdit && (
                    <Button size="sm" variant="outline" onClick={() => onEdit(item)} className="flex-1">
                      Redaktə
                    </Button>
                  )}
                  {onDelete && (
                    <Button size="sm" variant="outline" onClick={() => onDelete(item)} className="flex-1">
                      Sil
                    </Button>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};