"use client";

import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

type WeekFilter = "this" | "next" | "both";

interface WeekSelectorProps {
  value: WeekFilter;
  onChange: (value: WeekFilter) => void;
}

const OPTIONS: { value: WeekFilter; label: string }[] = [
  { value: "this", label: "This Week" },
  { value: "next", label: "Next Week" },
  { value: "both", label: "Both" },
];

export function WeekSelector({ value, onChange }: WeekSelectorProps) {
  return (
    <ToggleGroup
      type="single"
      variant="outline"
      value={value}
      onValueChange={(val) => {
        if (val) onChange(val as WeekFilter);
      }}
    >
      {OPTIONS.map((opt) => (
        <ToggleGroupItem key={opt.value} value={opt.value} className="px-4">
          {opt.label}
        </ToggleGroupItem>
      ))}
    </ToggleGroup>
  );
}
