"use client";

import { format } from "date-fns";
import { Clock3 } from "lucide-react";
import { DatePickerField } from "@/components/admin/DatePickerField";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useMemo, useState } from "react";

type DateTimePickerFieldProps = {
  dateName: string;
  timeName: string;
  datePlaceholder: string;
  initialDate?: string;
  initialTime: string;
  timeLabel: string;
  compact?: boolean;
};

function formatTime(value: string) {
  const [hours, minutes] = value.split(":").map(Number);
  return format(new Date(2000, 0, 1, hours || 0, minutes || 0), "hh:mm a");
}

/** Shared shadcn calendar and time dropdown, with named fields for FormData. */
export function DateTimePickerField({
  dateName,
  timeName,
  datePlaceholder,
  initialDate,
  initialTime,
  timeLabel,
  compact = false,
}: DateTimePickerFieldProps) {
  const [time, setTime] = useState(initialTime);
  const timeOptions = useMemo(() => {
    const values = Array.from({ length: 288 }, (_, index) => {
      const minutes = index * 5;
      return `${String(Math.floor(minutes / 60)).padStart(2, "0")}:${String(minutes % 60).padStart(2, "0")}`;
    });
    if (!values.includes(initialTime)) values.push(initialTime);
    return values.sort();
  }, [initialTime]);

  return (
    <div className="date-time-picker">
      <DatePickerField
        name={dateName}
        placeholder={datePlaceholder}
        initialValue={initialDate}
        compact={compact}
      />
      <input type="hidden" name={timeName} value={time} />
      <Select value={time} onValueChange={setTime}>
        <SelectTrigger className="time-select-trigger" aria-label={timeLabel}>
          <Clock3 aria-hidden="true" />
          <SelectValue placeholder="Select time" />
        </SelectTrigger>
        <SelectContent className="time-select-content" position="popper" align="start">
          {timeOptions.map((option) => (
            <SelectItem key={option} value={option}>
              {formatTime(option)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
