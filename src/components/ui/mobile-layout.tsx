import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface MobileLayoutProps {
  children: ReactNode;
  className?: string;
}

// Mobile-optimized container that prevents layout shifting
export const MobileContainer = ({ children, className }: MobileLayoutProps) => (
  <div className={cn(
    "w-full min-w-0 max-w-full",
    "overflow-hidden",
    className
  )}>
    {children}
  </div>
);

// Mobile-optimized flex row with proper spacing
export const MobileFlexRow = ({ children, className }: MobileLayoutProps) => (
  <div className={cn(
    "flex items-start gap-2 min-w-0",
    "md:items-center md:gap-4",
    className
  )}>
    {children}
  </div>
);

// Mobile-optimized flex between layout that prevents shifting
export const MobileFlexBetween = ({ children, className }: MobileLayoutProps) => (
  <div className={cn(
    "flex items-start justify-between gap-2 min-w-0",
    "md:items-center",
    className
  )}>
    {children}
  </div>
);

// Mobile-safe text that truncates properly
export const MobileText = ({ 
  children, 
  className,
  variant = "body"
}: MobileLayoutProps & { variant?: "body" | "title" | "subtitle" | "caption" }) => {
  const baseClasses = "min-w-0 break-words";
  
  const variantClasses = {
    body: "text-sm md:text-base",
    title: "text-lg md:text-xl font-medium",
    subtitle: "text-base md:text-lg font-medium", 
    caption: "text-xs md:text-sm text-muted-foreground"
  };

  return (
    <span className={cn(
      baseClasses,
      variantClasses[variant],
      className
    )}>
      {children}
    </span>
  );
};

// Mobile-safe button container
export const MobileButtonGroup = ({ children, className }: MobileLayoutProps) => (
  <div className={cn(
    "flex gap-1 flex-shrink-0",
    "md:gap-2",
    className
  )}>
    {children}
  </div>
);