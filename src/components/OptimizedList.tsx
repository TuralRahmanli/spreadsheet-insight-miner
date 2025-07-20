import { memo, useMemo } from 'react';

interface OptimizedListProps<T> {
  items: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  keyExtractor: (item: T) => string;
  className?: string;
}

export const OptimizedList = memo(<T,>({
  items,
  renderItem,
  keyExtractor,
  className
}: OptimizedListProps<T>) => {
  const memoizedItems = useMemo(() => 
    items.map((item, index) => ({
      key: keyExtractor(item),
      node: renderItem(item, index)
    })), 
    [items, renderItem, keyExtractor]
  );

  return (
    <div className={className}>
      {memoizedItems.map(({ key, node }) => (
        <div key={key}>
          {node}
        </div>
      ))}
    </div>
  );
});

OptimizedList.displayName = 'OptimizedList';