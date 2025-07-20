import { memo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface PerformanceCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon?: React.ReactNode;
  className?: string;
}

export const PerformanceCard = memo(({ 
  title, 
  value, 
  description, 
  icon, 
  className 
}: PerformanceCardProps) => (
  <Card className={className}>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
      {icon}
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{value}</div>
      {description && (
        <p className="text-xs text-muted-foreground">{description}</p>
      )}
    </CardContent>
  </Card>
));

PerformanceCard.displayName = 'PerformanceCard';