"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2 } from "lucide-react";
import type { ClientShoppingItem } from "@/lib/types";

interface CartItemRowProps {
  item: ClientShoppingItem;
  onToggleChecked: (itemId: string, checked: boolean) => void;
  onEdit: (item: ClientShoppingItem) => void;
  onDelete: (itemId: string) => void;
}

function formatQuantity(quantity: number, unit: string): string {
  const parts: string[] = [];
  if (quantity > 0) parts.push(String(quantity));
  if (unit) parts.push(unit);
  return parts.join(" ");
}

export function CartItemRow({
  item,
  onToggleChecked,
  onEdit,
  onDelete,
}: CartItemRowProps) {
  const quantityDisplay = formatQuantity(item.quantity, item.unit);

  return (
    <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors">
      <Checkbox
        checked={item.checked}
        onCheckedChange={(checked) =>
          onToggleChecked(item._id, checked === true)
        }
        id={`item-${item._id}`}
      />
      <label
        htmlFor={`item-${item._id}`}
        className={`flex-1 cursor-pointer ${
          item.checked ? "line-through text-muted-foreground" : ""
        }`}
      >
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span>{item.name}</span>
            {item.source === "plan" && (
              <span className="text-xs text-muted-foreground">(from plan)</span>
            )}
          </div>
          {quantityDisplay && (
            <span className="text-sm text-muted-foreground shrink-0">
              {quantityDisplay}
            </span>
          )}
        </div>
      </label>
      {item.source === "manual" && (
        <div className="flex gap-1 shrink-0">
          <Button
            variant="ghost"
            size="icon"
            className="size-7"
            onClick={() => onEdit(item)}
          >
            <Pencil className="size-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="size-7 text-destructive hover:text-destructive"
            onClick={() => onDelete(item._id)}
          >
            <Trash2 className="size-3.5" />
          </Button>
        </div>
      )}
    </div>
  );
}
