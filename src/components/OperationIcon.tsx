import { ArrowDown, ArrowUp, ShoppingCart, ArrowRightLeft, Package } from "lucide-react";

interface OperationIconProps {
  type: string;
  className?: string;
}

export const OperationIcon = ({ type, className = "h-4 w-4" }: OperationIconProps) => {
  switch (type) {
    case 'daxil':
      return <ArrowDown className={`${className} text-success`} />;
    case 'xaric':
      return <ArrowUp className={`${className} text-warning`} />;
    case 'satış':
      return <ShoppingCart className={`${className} text-info`} />;
    case 'transfer':
      return <ArrowRightLeft className={`${className} text-muted-foreground`} />;
    case 'əvvəldən_qalıq':
      return <Package className={`${className} text-primary`} />;
    default:
      return <Package className={`${className} text-foreground`} />;
  }
};