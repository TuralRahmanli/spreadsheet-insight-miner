import { Download, Upload, DollarSign, ArrowRightLeft, FileText, Package } from 'lucide-react';

interface OperationIconProps {
  type: string;
  className?: string;
}

export const OperationIcon = ({ type, className = "h-4 w-4 inline mr-1" }: OperationIconProps) => {
  switch (type) {
    case 'daxil': 
      return <Download className={className} />;
    case 'xaric': 
      return <Upload className={className} />; 
    case 'satış': 
      return <DollarSign className={className} />;
    case 'transfer': 
      return <ArrowRightLeft className={className} />;
    case 'əvvəldən_qalıq': 
      return <Package className={className} />;
    default: 
      return <FileText className={className} />;
  }
};