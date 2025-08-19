import { useState } from "react";
import { format } from "date-fns";
import { az } from "date-fns/locale";
import { CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Slider } from "@/components/ui/slider";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface DateTimePickerProps {
  value: Date;
  onChange: (date: Date) => void;
  placeholder?: string;
  disabled?: boolean;
}

export function DateTimePicker({ 
  value, 
  onChange, 
  placeholder = "Tarix və saat seçin",
  disabled = false 
}: DateTimePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>(value || new Date());
  const [hours, setHours] = useState(value?.getHours() || new Date().getHours());
  const [minutes, setMinutes] = useState(value?.getMinutes() || new Date().getMinutes());

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      const newDate = new Date(date);
      newDate.setHours(hours, minutes);
      setSelectedDate(newDate);
    }
  };

  const handleHourChange = (newHours: number[]) => {
    const hour = newHours[0];
    setHours(hour);
    const newDate = new Date(selectedDate);
    newDate.setHours(hour, minutes);
    setSelectedDate(newDate);
  };

  const handleMinuteChange = (newMinutes: number[]) => {
    const minute = newMinutes[0];
    setMinutes(minute);
    const newDate = new Date(selectedDate);
    newDate.setHours(hours, minute);
    setSelectedDate(newDate);
  };

  const handleConfirm = () => {
    const finalDate = new Date(selectedDate);
    finalDate.setHours(hours, minutes);
    onChange(finalDate);
    setIsOpen(false);
  };

  const displayValue = value 
    ? format(value, "dd MMMM yyyy, HH:mm", { locale: az })
    : placeholder;

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen} modal={true}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-full justify-start text-left font-normal",
            !value && "text-muted-foreground"
          )}
          disabled={disabled}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {displayValue}
        </Button>
      </PopoverTrigger>
      
      <PopoverContent 
        className="w-auto p-0 z-50" 
        align="center"
        side="bottom"
        sideOffset={4}
        avoidCollisions={true}
        collisionPadding={16}
      >
        <div className="p-1 space-y-1.5 bg-background border rounded-md shadow-lg max-h-[50vh] max-w-[80vw] overflow-y-auto transform scale-95">
          {/* Calendar */}
          <div className="border rounded-md bg-card">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={handleDateSelect}
              disabled={(date) =>
                date > new Date() || date < new Date("1900-01-01")
              }
              initialFocus
              className="pointer-events-auto p-0 text-xs transform scale-75"
            />
          </div>
          
          {/* Time Controls */}
          <div className="space-y-1 px-0">
            <div className="text-center text-[10px] font-medium">
              Saat: {hours.toString().padStart(2, '0')}:{minutes.toString().padStart(2, '0')}
            </div>
            
            <div className="space-y-1">
              <div className="space-y-0">
                <label className="text-[10px] font-medium">Saat:</label>
                <Slider
                  value={[hours]}
                  onValueChange={handleHourChange}
                  max={23}
                  min={0}
                  step={1}
                  className="w-full h-3"
                />
                <div className="flex justify-between text-[8px] text-muted-foreground">
                  <span>00</span>
                  <span>23</span>
                </div>
              </div>
              
              <div className="space-y-0">
                <label className="text-[10px] font-medium">Dəqiqə:</label>
                <Slider
                  value={[minutes]}
                  onValueChange={handleMinuteChange}
                  max={59}
                  min={0}
                  step={1}
                  className="w-full h-3"
                />
                <div className="flex justify-between text-[8px] text-muted-foreground">
                  <span>00</span>
                  <span>59</span>
                </div>
              </div>
            </div>
            
            {/* Selected DateTime Display */}
            <div className="text-center text-[8px] bg-muted p-0.5 rounded">
              {format(selectedDate, "yyyy-MM-dd HH:mm", { locale: az })}
            </div>
            
            {/* Confirm Button */}
            <Button 
              onClick={handleConfirm}
              className="w-full h-6 text-[10px]"
            >
              Təsdiq
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
