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
  hideMeasurement?: boolean;
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
  hideMeasurement = false,
}: CartItemRowProps) {
  const quantityDisplay = hideMeasurement
    ? ""
    : formatQuantity(item.quantity, item.unit);

  return (
    <div className="flex items-center gap-4 px-5 py-4 transition-colors hover:bg-muted/40">
      <Checkbox
        checked={item.checked}
        onCheckedChange={(checked) =>
          onToggleChecked(item._id, checked === true)
        }
        id={`item-${item._id}`}
        className="size-5 rounded-md"
      />
      <label
        htmlFor={`item-${item._id}`}
        className={`flex-1 cursor-pointer ${
          item.checked ? "line-through text-muted-foreground" : ""
        }`}
      >
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 min-w-0">
            <span className="font-headline font-semibold text-card-foreground truncate">
              {item.name}
            </span>
            {item.source === "plan" && (
              <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/80">
                from plan
              </span>
            )}
          </div>
          {quantityDisplay && (
            <span className="text-xs font-medium text-muted-foreground shrink-0">
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
            className="size-8 rounded-full"
            onClick={() => onEdit(item)}
          >
            <Pencil className="size-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="size-8 rounded-full text-destructive hover:text-destructive"
            onClick={() => onDelete(item._id)}
          >
            <Trash2 className="size-3.5" />
          </Button>
        </div>
      )}
    </div>
  );
}
