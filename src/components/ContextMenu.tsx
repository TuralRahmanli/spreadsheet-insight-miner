import { ReactNode, useState, useRef, useEffect } from 'react';
import { useLongPress } from '@/hooks/useLongPress';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Edit, Trash, Copy, Share2, Archive } from 'lucide-react';

interface ContextMenuItem {
  id: string;
  label: string;
  icon: ReactNode;
  action: () => void;
  variant?: 'default' | 'destructive';
  disabled?: boolean;
}

interface ContextMenuProps {
  children: ReactNode;
  items: ContextMenuItem[];
  disabled?: boolean;
}

export function ContextMenu({ children, items, disabled = false }: ContextMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const menuRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLDivElement>(null);

  const handleLongPress = (event?: React.TouchEvent | React.MouseEvent) => {
    if (disabled) return;
    
    const clientX = 'touches' in (event as any) 
      ? (event as React.TouchEvent).touches[0].clientX 
      : (event as React.MouseEvent).clientX;
    const clientY = 'touches' in (event as any) 
      ? (event as React.TouchEvent).touches[0].clientY 
      : (event as React.MouseEvent).clientY;

    setPosition({ x: clientX, y: clientY });
    setIsOpen(true);
  };

  const longPressEvents = useLongPress({
    onLongPress: handleLongPress,
    delay: 600,
    shouldPreventDefault: false,
    shouldStopPropagation: false
  });

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [isOpen]);

  // Handle menu item click
  const handleItemClick = (item: ContextMenuItem) => {
    if (!item.disabled) {
      item.action();
    }
    setIsOpen(false);
  };

  // Position menu to stay within viewport
  const getMenuStyle = () => {
    if (!menuRef.current) return { left: position.x, top: position.y };
    
    const rect = menuRef.current.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    
    let left = position.x;
    let top = position.y;
    
    // Adjust horizontal position
    if (left + rect.width > viewportWidth) {
      left = viewportWidth - rect.width - 10;
    }
    
    // Adjust vertical position
    if (top + rect.height > viewportHeight) {
      top = position.y - rect.height;
    }
    
    return { left: Math.max(10, left), top: Math.max(10, top) };
  };

  return (
    <>
      {/* Trigger element */}
      <div 
        ref={triggerRef}
        {...longPressEvents}
        style={{ touchAction: 'manipulation' }}
      >
        {children}
      </div>

      {/* Context menu */}
      {isOpen && (
        <div className="fixed inset-0 z-50">
          <div 
            className="absolute inset-0 bg-black/20"
            onClick={() => setIsOpen(false)}
          />
          <Card 
            ref={menuRef}
            className="absolute z-10 min-w-48 shadow-lg"
            style={getMenuStyle()}
          >
            <CardContent className="p-1">
              {items.map((item) => (
                <Button
                  key={item.id}
                  variant={item.variant === 'destructive' ? 'destructive' : 'ghost'}
                  className="w-full justify-start gap-2 h-auto py-2"
                  onClick={() => handleItemClick(item)}
                  disabled={item.disabled}
                >
                  {item.icon}
                  {item.label}
                </Button>
              ))}
            </CardContent>
          </Card>
        </div>
      )}
    </>
  );
}

// Predefined context menu types for common use cases
export function ProductContextMenu({ 
  children, 
  onEdit, 
  onDelete, 
  onDuplicate, 
  onArchive,
  disabled = false
}: {
  children: ReactNode;
  onEdit?: () => void;
  onDelete?: () => void;
  onDuplicate?: () => void;
  onArchive?: () => void;
  disabled?: boolean;
}) {
  const items: ContextMenuItem[] = [
    ...(onEdit ? [{
      id: 'edit',
      label: 'Redaktə et',
      icon: <Edit className="h-4 w-4" />,
      action: onEdit
    }] : []),
    ...(onDuplicate ? [{
      id: 'duplicate',
      label: 'Kopyala',
      icon: <Copy className="h-4 w-4" />,
      action: onDuplicate
    }] : []),
    ...(onArchive ? [{
      id: 'archive',
      label: 'Arxivləşdir',
      icon: <Archive className="h-4 w-4" />,
      action: onArchive
    }] : []),
    ...(onDelete ? [{
      id: 'delete',
      label: 'Sil',
      icon: <Trash className="h-4 w-4" />,
      action: onDelete,
      variant: 'destructive' as const
    }] : [])
  ];

  return (
    <ContextMenu items={items} disabled={disabled}>
      {children}
    </ContextMenu>
  );
}