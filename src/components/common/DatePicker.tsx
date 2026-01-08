import React, { useState } from 'react';
import { Button } from "../ui/button";
import { Popover, PopoverTrigger, PopoverContent } from "../ui/popover";
import { Calendar } from "../ui/calendar";
import { Label } from "../ui/label";
import { Calendar as CalendarIcon } from "lucide-react";
import { format } from "date-fns";

// small classNames helper
const cn = (...args: Array<string | false | null | undefined>) => args.filter(Boolean).join(' ');

export interface DatePickerProps {
  label?: string;
  value?: Date | null;
  onChange: (d: Date | null) => void;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  formatStr?: string;
  className?: string;
  align?: "start" | "center" | "end";
}

export default function DatePicker({
  label,
  value,
  onChange,
  placeholder = "Pick a date",
  required = false,
  disabled = false,
  formatStr = "PPP",
  className,
  align = "start",
}: DatePickerProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="space-y-2">
      {label ? (
        <Label>
          {label} {required ? <span className="text-red-500">*</span> : null}
        </Label>
      ) : null}

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "w-full justify-start text-left",
              !value && "text-muted-foreground",
              className
            )}
            disabled={disabled}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {value ? format(value, formatStr) : <span>{placeholder}</span>}
          </Button>
        </PopoverTrigger>

        <PopoverContent className="w-auto p-0" align={align}>
          <Calendar
            mode="single"
            selected={value ?? undefined}
            onSelect={(date) => {
              if (date) {
                onChange(date);
                setOpen(false);
              }
            }}
            initialFocus
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}