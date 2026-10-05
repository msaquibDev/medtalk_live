"use client";

import { format } from "date-fns";
import { CalendarDays } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

type DatePickerFieldProps = {
  name: string;
  placeholder?: string;
  initialValue?: string;
};

/** A reusable shadcn calendar field. A hidden input keeps native FormData/API wiring simple. */
export function DatePickerField({ name, placeholder = "Choose a date", initialValue }: DatePickerFieldProps) {
  const [date, setDate] = useState<Date | undefined>(() => initialValue ? new Date(`${initialValue}T00:00:00`) : undefined);

  return (
    <>
      <input type="hidden" name={name} value={date ? format(date, "yyyy-MM-dd") : ""} />
      <Popover>
        <PopoverTrigger asChild>
          <Button type="button" variant="outline" className="date-picker-trigger">
            <CalendarDays aria-hidden="true" />
            {date ? format(date, "EEE, MMM d, yyyy") : placeholder}
          </Button>
        </PopoverTrigger>
        <PopoverContent align="start" className="w-auto p-0">
          <Calendar mode="single" selected={date} onSelect={setDate} />
        </PopoverContent>
      </Popover>
    </>
  );
}
