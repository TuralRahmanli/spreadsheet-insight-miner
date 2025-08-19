import React, { useMemo, useCallback, useState, useEffect } from 'react';
import { FixedSizeList as List } from 'react-window';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, ChevronUp, ChevronDown, ArrowUpDown } from 'lucide-react';

interface Column<T> {
  key: keyof T;
  label: string;
  width?: number;
  sortable?: boolean;
  filterable?: boolean;
  render?: (value: any, item: T) => React.ReactNode;
}

interface VirtualizedTableProps<T> {
  data: T[];
  columns: Column<T>[];
  height?: number;
  itemHeight?: number;
  searchable?: boolean;
  sortable?: boolean;
  onRowClick?: (item: T) => void;
  onRowDoubleClick?: (item: T) => void;
  className?: string;
}

type SortConfig<T> = {
  key: keyof T;
  direction: 'asc' | 'desc';
} | null;

export function VirtualizedTable<T extends Record<string, any>>({
  data,
  columns,
  height = 400,
  itemHeight = 50,
  searchable = true,
  sortable = true,
  onRowClick,
  onRowDoubleClick,
  className = ""
}: VirtualizedTableProps<T>) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState<SortConfig<T>>(null);
  const [columnFilters, setColumnFilters] = useState<Record<string, string>>({});

  // Memoized filtered and sorted data
  const processedData = useMemo(() => {
    let filtered = data;

    // Apply global search
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(item =>
        columns.some(col => {
          const value = item[col.key];
          return value?.toString().toLowerCase().includes(searchLower);
        })
      );
    }

    // Apply column filters
    Object.entries(columnFilters).forEach(([key, value]) => {
      if (value.trim()) {
        const filterLower = value.toLowerCase();
        filtered = filtered.filter(item => {
          const itemValue = item[key];
          return itemValue?.toString().toLowerCase().includes(filterLower);
        });
      }
    });

    // Apply sorting
    if (sortConfig && sortable) {
      filtered = [...filtered].sort((a, b) => {
        const aValue = a[sortConfig.key];
        const bValue = b[sortConfig.key];

        if (aValue < bValue) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }

    return filtered;
  }, [data, searchTerm, sortConfig, columnFilters, columns, sortable]);

  // Handle sorting
  const handleSort = useCallback((columnKey: keyof T) => {
    setSortConfig(current => {
      if (!current || current.key !== columnKey) {
        return { key: columnKey, direction: 'asc' };
      }
      if (current.direction === 'asc') {
        return { key: columnKey, direction: 'desc' };
      }
      return null;
    });
  }, []);

  // Handle column filter
  const handleColumnFilter = useCallback((columnKey: string, value: string) => {
    setColumnFilters(prev => ({
      ...prev,
      [columnKey]: value
    }));
  }, []);

  // Row renderer for react-window
  const Row = useCallback(({ index, style }: { index: number; style: React.CSSProperties }) => {
    const item = processedData[index];
    
    return (
      <div style={style} className="border-b border-border">
        <div 
          className={`flex items-center h-full cursor-pointer hover:bg-muted/50 ${
            onRowClick ? 'cursor-pointer' : ''
          }`}
          onClick={() => onRowClick?.(item)}
          onDoubleClick={() => onRowDoubleClick?.(item)}
        >
          {columns.map((column, colIndex) => {
            const value = item[column.key];
            const cellWidth = column.width || Math.floor(100 / columns.length);
            
            return (
              <div
                key={`${column.key as string}-${index}`}
                className="px-4 py-2 truncate"
                style={{ width: `${cellWidth}%`, minWidth: '100px' }}
                title={value?.toString() || ''}
              >
                {column.render ? column.render(value, item) : (
                  <span className="text-sm">{value?.toString() || '-'}</span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  }, [processedData, columns, onRowClick, onRowDoubleClick]);

  // Get sort icon for column header
  const getSortIcon = (columnKey: keyof T) => {
    if (!sortConfig || sortConfig.key !== columnKey) {
      return <ArrowUpDown className="h-3 w-3 opacity-50" />;
    }
    return sortConfig.direction === 'asc' 
      ? <ChevronUp className="h-3 w-3" />
      : <ChevronDown className="h-3 w-3" />;
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Search and Filters */}
      {searchable && (
        <div className="flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Axtar..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="text-sm text-muted-foreground">
            {processedData.length} / {data.length} nəticə
          </div>
        </div>
      )}

      {/* Column Filters */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2">
        {columns.filter(col => col.filterable).map(column => (
          <div key={column.key as string} className="space-y-1">
            <label className="text-xs text-muted-foreground">{column.label}</label>
            <Input
              placeholder={`${column.label} filteri`}
              value={columnFilters[column.key as string] || ''}
              onChange={(e) => handleColumnFilter(column.key as string, e.target.value)}
              className="h-8 text-xs"
            />
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="border rounded-lg overflow-hidden">
        {/* Header */}
        <div className="bg-muted/50 border-b">
          <div className="flex items-center h-12">
            {columns.map((column) => {
              const cellWidth = column.width || Math.floor(100 / columns.length);
              
              return (
                <div
                  key={column.key as string}
                  className="px-4 py-2 font-medium text-sm"
                  style={{ width: `${cellWidth}%`, minWidth: '100px' }}
                >
                  <div className="flex items-center justify-between">
                    <span className="truncate">{column.label}</span>
                    {sortable && column.sortable !== false && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0 ml-2"
                        onClick={() => handleSort(column.key)}
                      >
                        {getSortIcon(column.key)}
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Virtual List Body */}
        <div style={{ height }}>
          {processedData.length > 0 ? (
            <List
              height={height}
              itemCount={processedData.length}
              itemSize={itemHeight}
              width="100%"
            >
              {Row}
            </List>
          ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              <div className="text-center">
                <div className="text-2xl mb-2">📋</div>
                <div>Məlumat tapılmadı</div>
                {searchTerm && (
                  <Button 
                    variant="link" 
                    className="mt-2"
                    onClick={() => {
                      setSearchTerm('');
                      setColumnFilters({});
                    }}
                  >
                    Filterləri təmizlə
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer with stats */}
        {processedData.length > 0 && (
          <div className="bg-muted/30 border-t px-4 py-2 text-xs text-muted-foreground">
            <div className="flex justify-between items-center">
              <span>
                Göstərilən: {processedData.length} / Ümumi: {data.length}
              </span>
              {(searchTerm || Object.values(columnFilters).some(f => f.trim())) && (
                <Button
                  variant="link"
                  size="sm"
                  className="h-auto p-0 text-xs"
                  onClick={() => {
                    setSearchTerm('');
                    setColumnFilters({});
                    setSortConfig(null);
                  }}
                >
                  Hamısını təmizlə
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}