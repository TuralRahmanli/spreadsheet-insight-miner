import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// Dark mode optimized components with proper theming

interface DarkModeCardProps {
  children: React.ReactNode;
  className?: string;
  variant?: "default" | "outline" | "elevated";
}

export function DarkModeCard({ children, className, variant = "default" }: DarkModeCardProps) {
  return (
    <Card className={cn(
      "transition-colors duration-200",
      variant === "elevated" && "shadow-lg dark:shadow-2xl border-2",
      variant === "outline" && "border-2 border-muted-foreground/20",
      className
    )}>
      {children}
    </Card>
  );
}

interface DarkModeBadgeProps {
  children: React.ReactNode;
  variant?: "default" | "secondary" | "destructive" | "outline" | "success" | "warning" | "info";
  className?: string;
}

export function DarkModeBadge({ children, variant = "default", className }: DarkModeBadgeProps) {
  const variantClasses = {
    default: "bg-primary text-primary-foreground hover:bg-primary/80",
    secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
    destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/80",
    outline: "text-foreground border-foreground/20 hover:bg-accent hover:text-accent-foreground",
    success: "bg-green-500 text-white dark:bg-green-600 hover:bg-green-600 dark:hover:bg-green-700",
    warning: "bg-yellow-500 text-white dark:bg-yellow-600 hover:bg-yellow-600 dark:hover:bg-yellow-700",
    info: "bg-blue-500 text-white dark:bg-blue-600 hover:bg-blue-600 dark:hover:bg-blue-700"
  };

  return (
    <Badge className={cn(
      "transition-colors duration-200",
      variantClasses[variant],
      className
    )}>
      {children}
    </Badge>
  );
}

interface DarkModeButtonProps {
  children: React.ReactNode;
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
  onClick?: () => void;
  disabled?: boolean;
  type?: "button" | "submit" | "reset";
}

export function DarkModeButton({ 
  children, 
  variant = "default", 
  size = "default", 
  className,
  ...props 
}: DarkModeButtonProps) {
  return (
    <Button 
      variant={variant}
      size={size}
      className={cn(
        "transition-all duration-200",
        "focus:ring-2 focus:ring-ring focus:ring-offset-2",
        "dark:focus:ring-offset-background",
        variant === "outline" && "border-2 hover:border-primary",
        className
      )}
      {...props}
    >
      {children}
    </Button>
  );
}

// Status badges with proper dark mode support
export function StatusBadge({ status, stock }: { status: string; stock: number }) {
  if (status === "out_of_stock" || stock === 0) {
    return (
      <DarkModeBadge variant="destructive">
        Bitib
      </DarkModeBadge>
    );
  }
  if (status === "low_stock" || stock < 50) {
    return (
      <DarkModeBadge variant="warning">
        Az qalıb
      </DarkModeBadge>
    );
  }
  return (
    <DarkModeBadge variant="success">
      Mövcud
    </DarkModeBadge>
  );
}

// Themed table components
export function DarkModeTableHeader({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-muted/50 dark:bg-muted/20 p-2 rounded-t-lg border-b border-border">
      {children}
    </div>
  );
}

export function DarkModeTableRow({ 
  children, 
  onClick,
  selected 
}: { 
  children: React.ReactNode;
  onClick?: () => void;
  selected?: boolean;
}) {
  return (
    <div className={cn(
      "border-b border-border transition-colors duration-150",
      onClick && "cursor-pointer hover:bg-muted/50 dark:hover:bg-muted/20",
      selected && "bg-accent/50 dark:bg-accent/20"
    )}
    onClick={onClick}>
      {children}
    </div>
  );
}

// Loading state with dark mode support
export function DarkModeLoadingState({ text = "Yüklənir..." }: { text?: string }) {
  return (
    <div className="flex items-center justify-center p-8">
      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
      <span className="ml-2 text-muted-foreground">{text}</span>
    </div>
  );
}

// Empty state with dark mode support
export function DarkModeEmptyState({ 
  title, 
  description, 
  action 
}: { 
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="text-center p-8">
      <div className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4">
        <svg viewBox="0 0 24 24" fill="none" className="h-full w-full">
          <path
            d="M3 7H21L19 19H5L3 7Z"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M3 7L1 1H6L8 7"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
      <h3 className="text-lg font-medium text-foreground mb-2">{title}</h3>
      {description && (
        <p className="text-muted-foreground mb-4">{description}</p>
      )}
      {action}
    </div>
  );
}