import { useCallback, useRef, useState } from 'react';

interface DragDropOptions<T> {
  items: T[];
  onReorder: (newItems: T[]) => void;
  getId: (item: T) => string | number;
  isDisabled?: boolean;
}

interface DragDropResult {
  draggedItem: any;
  dragOverItem: any;
  isDragging: boolean;
  handleDragStart: (item: any) => (e: React.DragEvent) => void;
  handleDragEnd: () => void;
  handleDragOver: (item: any) => (e: React.DragEvent) => void;
  handleDragLeave: () => void;
  handleDrop: (item: any) => (e: React.DragEvent) => void;
  getDragProps: (item: any) => {
    draggable: boolean;
    onDragStart: (e: React.DragEvent) => void;
    onDragEnd: () => void;
  };
  getDropProps: (item: any) => {
    onDragOver: (e: React.DragEvent) => void;
    onDragLeave: () => void;
    onDrop: (e: React.DragEvent) => void;
    'data-drag-over': boolean;
  };
}

export function useDragAndDrop<T>({
  items,
  onReorder,
  getId,
  isDisabled = false
}: DragDropOptions<T>): DragDropResult {
  const [draggedItem, setDraggedItem] = useState<T | null>(null);
  const [dragOverItem, setDragOverItem] = useState<T | null>(null);
  const dragCounter = useRef(0);

  const isDragging = draggedItem !== null;

  const handleDragStart = useCallback((item: T) => (e: React.DragEvent) => {
    if (isDisabled) return;
    
    setDraggedItem(item);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', getId(item).toString());
    
    // Add visual feedback
    if (e.currentTarget instanceof HTMLElement) {
      e.currentTarget.style.opacity = '0.5';
    }
  }, [getId, isDisabled]);

  const handleDragEnd = useCallback(() => {
    setDraggedItem(null);
    setDragOverItem(null);
    dragCounter.current = 0;
    
    // Reset visual feedback
    document.querySelectorAll('[data-dragging]').forEach(el => {
      if (el instanceof HTMLElement) {
        el.style.opacity = '';
        el.removeAttribute('data-dragging');
      }
    });
  }, []);

  const handleDragOver = useCallback((item: T) => (e: React.DragEvent) => {
    if (isDisabled || !draggedItem) return;
    
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    
    if (item !== dragOverItem) {
      setDragOverItem(item);
    }
  }, [draggedItem, dragOverItem, isDisabled]);

  const handleDragLeave = useCallback(() => {
    dragCounter.current--;
    if (dragCounter.current === 0) {
      setDragOverItem(null);
    }
  }, []);

  const handleDrop = useCallback((targetItem: T) => (e: React.DragEvent) => {
    if (isDisabled || !draggedItem) return;
    
    e.preventDefault();
    
    if (draggedItem !== targetItem) {
      const draggedIndex = items.findIndex(item => getId(item) === getId(draggedItem));
      const targetIndex = items.findIndex(item => getId(item) === getId(targetItem));
      
      if (draggedIndex !== -1 && targetIndex !== -1) {
        const newItems = [...items];
        const draggedElement = newItems[draggedIndex];
        const itemsWithoutDragged = newItems.filter((_, index) => index !== draggedIndex);
        const reorderedItems = [
          ...itemsWithoutDragged.slice(0, targetIndex > draggedIndex ? targetIndex - 1 : targetIndex),
          draggedElement,
          ...itemsWithoutDragged.slice(targetIndex > draggedIndex ? targetIndex - 1 : targetIndex)
        ];
        onReorder(reorderedItems);
      }
    }
    
    handleDragEnd();
  }, [draggedItem, items, getId, onReorder, isDisabled, handleDragEnd]);

  const getDragProps = useCallback((item: T) => ({
    draggable: !isDisabled,
    onDragStart: handleDragStart(item),
    onDragEnd: handleDragEnd
  }), [handleDragStart, handleDragEnd, isDisabled]);

  const getDropProps = useCallback((item: T) => ({
    onDragOver: handleDragOver(item),
    onDragLeave: handleDragLeave,
    onDrop: handleDrop(item),
    'data-drag-over': dragOverItem === item
  }), [handleDragOver, handleDragLeave, handleDrop, dragOverItem]);

  return {
    draggedItem,
    dragOverItem,
    isDragging,
    handleDragStart,
    handleDragEnd,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    getDragProps,
    getDropProps
  };
}