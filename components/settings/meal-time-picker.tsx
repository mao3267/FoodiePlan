"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Clock } from "lucide-react";

interface MealTimePickerProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
}

export function MealTimePicker({
  label,
  value,
  onChange,
}: MealTimePickerProps) {
  return (
    <div className="flex items-center gap-3">
      <Clock className="size-4 text-muted-foreground" />
      <Label className="w-20 text-sm">{label}</Label>
      <Input
        type="time"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-32"
      />
    </div>
  );
}
