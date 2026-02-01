"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

interface IngredientRowProps {
  ingredient: { name: string; quantity: number; unit: string };
  index: number;
  onUpdate: (index: number, field: "name" | "quantity" | "unit", value: string | number) => void;
  onRemove: (index: number) => void;
}

export function IngredientRow({
  ingredient,
  index,
  onUpdate,
  onRemove,
}: IngredientRowProps) {
  return (
    <div className="flex items-center gap-2">
      <Input
        placeholder="Name"
        value={ingredient.name}
        onChange={(e) => onUpdate(index, "name", e.target.value)}
        className="flex-1"
      />
      <Input
        type="number"
        placeholder="Qty"
        min={0}
        step="any"
        value={ingredient.quantity}
        onChange={(e) =>
          onUpdate(index, "quantity", Math.max(0, parseFloat(e.target.value) || 0))
        }
        className="w-20"
      />
      <Input
        placeholder="Unit"
        value={ingredient.unit}
        onChange={(e) => onUpdate(index, "unit", e.target.value)}
        className="w-24"
      />
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="size-8 shrink-0"
        onClick={() => onRemove(index)}
      >
        <X className="size-4" />
      </Button>
    </div>
  );
}
