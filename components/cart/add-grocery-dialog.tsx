"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { ClientShoppingItem } from "@/lib/types";

interface AddGroceryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editItem?: ClientShoppingItem | null;
  onItemSaved: () => void;
}

interface FormState {
  name: string;
  quantity: number;
  unit: string;
}

const INITIAL_FORM: FormState = {
  name: "",
  quantity: 1,
  unit: "",
};

export function AddGroceryDialog({
  open,
  onOpenChange,
  editItem,
  onItemSaved,
}: AddGroceryDialogProps) {
  const [form, setForm] = useState<FormState>(INITIAL_FORM);
  const [submitting, setSubmitting] = useState(false);

  const isEditMode = !!editItem;

  useEffect(() => {
    if (editItem) {
      setForm({
        name: editItem.name,
        quantity: editItem.quantity,
        unit: editItem.unit,
      });
    } else {
      setForm(INITIAL_FORM);
    }
  }, [editItem, open]);

  function updateField<K extends keyof FormState>(
    key: K,
    value: FormState[K]
  ) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!form.name.trim()) return;

    setSubmitting(true);

    try {
      if (isEditMode && editItem) {
        const res = await fetch(`/api/shopping-list/${editItem._id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: form.name.trim(),
            quantity: form.quantity,
            unit: form.unit.trim(),
          }),
        });
        if (res.ok) {
          onItemSaved();
          onOpenChange(false);
        } else {
          const data = await res.json().catch(() => null);
          toast.error(data?.error ?? "Failed to update item");
        }
      } else {
        const res = await fetch("/api/shopping-list", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: form.name.trim(),
            quantity: form.quantity,
            unit: form.unit.trim(),
          }),
        });
        if (res.ok) {
          onItemSaved();
          onOpenChange(false);
        } else {
          const data = await res.json().catch(() => null);
          toast.error(data?.error ?? "Failed to add item");
        }
      }
    } catch {
      toast.error("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {isEditMode ? "Edit Grocery" : "Add Grocery"}
          </DialogTitle>
          <DialogDescription className="sr-only">
            {isEditMode
              ? "Update the details of this grocery item"
              : "Add a new item to your shopping list"}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="grocery-name">Name</Label>
            <Input
              id="grocery-name"
              placeholder="e.g., Paper towels"
              value={form.name}
              onChange={(e) => updateField("name", e.target.value)}
              required
            />
          </div>

          <div className="flex gap-3">
            <div className="space-y-2 flex-1">
              <Label htmlFor="grocery-quantity">Quantity</Label>
              <Input
                id="grocery-quantity"
                type="number"
                min={0}
                step="any"
                value={form.quantity}
                onChange={(e) =>
                  updateField(
                    "quantity",
                    Math.max(0, parseFloat(e.target.value) || 0)
                  )
                }
              />
            </div>
            <div className="space-y-2 flex-1">
              <Label htmlFor="grocery-unit">Unit</Label>
              <Input
                id="grocery-unit"
                placeholder="e.g., lbs, cups"
                value={form.unit}
                onChange={(e) => updateField("unit", e.target.value)}
              />
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={submitting}>
            {isEditMode ? "Update" : "Add to Cart"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
