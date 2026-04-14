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
      className="inline-flex gap-2 rounded-full bg-muted p-1.5"
    >
      {OPTIONS.map((opt) => (
        <ToggleGroupItem
          key={opt.value}
          value={opt.value}
          className="rounded-full border-0 px-5 py-2 font-headline font-bold text-xs uppercase tracking-widest text-muted-foreground data-[state=on]:signature-gradient data-[state=on]:text-white data-[state=on]:shadow-sm"
        >
          {opt.label}
        </ToggleGroupItem>
      ))}
    </ToggleGroup>
  );
}
