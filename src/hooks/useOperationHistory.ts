import { useState, useEffect } from 'react';
import { useProductStore } from '@/lib/productStore';

interface OperationRecord {
  id: string;
  type: 'daxil' | 'xaric' | 'satış' | 'transfer';
  productName: string;
  quantity: number;
  timestamp: Date;
  warehouse?: string;
}

export const useOperationHistory = () => {
  const [operations, setOperations] = useState<OperationRecord[]>([]);
  const { products } = useProductStore();

  useEffect(() => {
    // Generate dynamic recent operations based on current products
    const generateRecentOperations = () => {
      if (products.length === 0) return [];

      const operationTypes: Array<'daxil' | 'xaric' | 'satış' | 'transfer'> = ['daxil', 'xaric', 'satış', 'transfer'];
      const recentOps: OperationRecord[] = [];

      // Generate 3-5 recent operations
      const numOperations = Math.min(products.length, 5);
      
      for (let i = 0; i < numOperations; i++) {
        const product = products[i % products.length];
        const type = operationTypes[Math.floor(Math.random() * operationTypes.length)];
        const quantity = Math.floor(Math.random() * 50) + 1;
        
        // Generate timestamps for last 3 days
        const daysAgo = Math.floor(Math.random() * 3);
        const hoursAgo = Math.floor(Math.random() * 24);
        const timestamp = new Date();
        timestamp.setDate(timestamp.getDate() - daysAgo);
        timestamp.setHours(timestamp.getHours() - hoursAgo);

        recentOps.push({
          id: `op-${Date.now()}-${i}`,
          type,
          productName: product.name,
          quantity,
          timestamp,
          warehouse: product.warehouses[0] || 'Anbar 1'
        });
      }

      return recentOps.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    };

    setOperations(generateRecentOperations());
  }, [products]);

  const addOperation = (operation: Omit<OperationRecord, 'id' | 'timestamp'>) => {
    const newOperation: OperationRecord = {
      ...operation,
      id: `op-${Date.now()}`,
      timestamp: new Date()
    };

    setOperations(prev => [newOperation, ...prev].slice(0, 10)); // Keep only last 10
  };

  const formatTimestamp = (timestamp: Date) => {
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - timestamp.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'İndi';
    if (diffInHours < 24) return `${diffInHours} saat əvvəl`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays === 1) return 'Dünən';
    if (diffInDays < 7) return `${diffInDays} gün əvvəl`;
    
    return timestamp.toLocaleDateString('az-AZ');
  };

  const getOperationIcon = (type: string) => {
    switch (type) {
      case 'daxil': return '📥';
      case 'xaric': return '📤'; 
      case 'satış': return '💰';
      case 'transfer': return '🔄';
      default: return '📋';
    }
  };

  const getOperationColor = (type: string) => {
    switch (type) {
      case 'daxil': return 'text-success';
      case 'xaric': return 'text-warning';
      case 'satış': return 'text-info';
      case 'transfer': return 'text-muted-foreground';
      default: return 'text-foreground';
    }
  };

  return {
    operations,
    addOperation,
    formatTimestamp,
    getOperationIcon,
    getOperationColor
  };
};