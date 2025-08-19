import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Settings, GripVertical } from "lucide-react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import {
  CSS,
} from '@dnd-kit/utilities';

interface ProductTableSettingsProps {
  columnLabels: Record<string, string>;
  columnVisibility: Record<string, boolean>;
  columnOrder: string[];
  onColumnVisibilityChange: (visibility: Record<string, boolean>) => void;
  onColumnOrderChange: (order: string[]) => void;
}

interface SortableColumnItemProps {
  id: string;
  label: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
}

function SortableColumnItem({ id, label, checked, onCheckedChange }: SortableColumnItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div 
      ref={setNodeRef} 
      style={style} 
      className={`flex items-center space-x-2 p-2 rounded border bg-background ${isDragging ? 'shadow-lg' : ''}`}
    >
      <div 
        {...attributes} 
        {...listeners} 
        className="cursor-grab hover:cursor-grabbing"
      >
        <GripVertical className="h-4 w-4 text-muted-foreground" />
      </div>
      <Checkbox
        id={id}
        checked={checked}
        onCheckedChange={onCheckedChange}
      />
      <Label htmlFor={id} className="text-sm truncate flex-1 cursor-pointer" title={label}>
        {label}
      </Label>
    </div>
  );
}

export function ProductTableSettings({ 
  columnLabels, 
  columnVisibility,
  columnOrder,
  onColumnVisibilityChange,
  onColumnOrderChange
}: ProductTableSettingsProps) {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleColumnToggle = (key: string, checked: boolean) => {
    onColumnVisibilityChange({ ...columnVisibility, [key]: checked });
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      const oldIndex = columnOrder.indexOf(active.id as string);
      const newIndex = columnOrder.indexOf(over?.id as string);
      onColumnOrderChange(arrayMove(columnOrder, oldIndex, newIndex));
    }
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm">
          <Settings className="mr-2 h-4 w-4" />
          Sütunlar
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-96">
        <div className="space-y-4">
          <h4 className="font-medium leading-none">Sütun Görünümü və Sırası</h4>
          <div className="max-h-80 overflow-y-auto">
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext items={columnOrder} strategy={verticalListSortingStrategy}>
                <div className="space-y-2">
                  {columnOrder.map((key) => (
                    <SortableColumnItem
                      key={key}
                      id={key}
                      label={columnLabels[key]}
                      checked={columnVisibility[key]}
                      onCheckedChange={(checked) => handleColumnToggle(key, !!checked)}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}