"use client";

import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { ShoppingCart, Plus } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { WeekSelector } from "@/components/cart/week-selector";
import { CartItemRow } from "@/components/cart/cart-item-row";
import { AddGroceryDialog } from "@/components/cart/add-grocery-dialog";
import type { ClientShoppingItem } from "@/lib/types";

type WeekFilter = "this" | "next" | "both";

export function CartPageContent() {
  const [items, setItems] = useState<ClientShoppingItem[]>([]);
  const [weekFilter, setWeekFilter] = useState<WeekFilter>("this");
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editItem, setEditItem] = useState<ClientShoppingItem | null>(null);

  const fetchItems = useCallback(async (weeks: WeekFilter) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/shopping-list?weeks=${weeks}`);
      if (res.ok) {
        const data = await res.json();
        setItems(data.items ?? []);
      } else {
        toast.error("Failed to load shopping list");
      }
    } catch {
      toast.error("Network error loading shopping list");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchItems(weekFilter);
  }, [weekFilter, fetchItems]);

  async function handleToggleChecked(itemId: string, checked: boolean) {
    setItems((prev) =>
      prev.map((item) =>
        item._id === itemId ? { ...item, checked } : item
      )
    );

    try {
      const res = await fetch(`/api/shopping-list/${itemId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ checked }),
      });
      if (!res.ok) {
        setItems((prev) =>
          prev.map((item) =>
            item._id === itemId ? { ...item, checked: !checked } : item
          )
        );
        toast.error("Failed to update item");
      }
    } catch {
      setItems((prev) =>
        prev.map((item) =>
          item._id === itemId ? { ...item, checked: !checked } : item
        )
      );
      toast.error("Network error");
    }
  }

  async function handleDeleteItem(itemId: string) {
    const previous = items;
    setItems((prev) => prev.filter((item) => item._id !== itemId));

    try {
      const res = await fetch(`/api/shopping-list/${itemId}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        setItems(previous);
        const data = await res.json().catch(() => null);
        toast.error(data?.error ?? "Failed to delete item");
      }
    } catch {
      setItems(previous);
      toast.error("Network error");
    }
  }

  function handleEditClick(item: ClientShoppingItem) {
    setEditItem(item);
    setDialogOpen(true);
  }

  function handleAddClick() {
    setEditItem(null);
    setDialogOpen(true);
  }

  function handleItemSaved() {
    fetchItems(weekFilter);
  }

  const checkedCount = items.filter((i) => i.checked).length;
  const totalCount = items.length;

  const sortedItems = [...items].sort((a, b) => {
    if (a.checked !== b.checked) return a.checked ? 1 : -1;
    return a.name.localeCompare(b.name);
  });

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl mb-2">Shopping Cart</h1>
          {totalCount > 0 && (
            <p className="text-muted-foreground">
              {checkedCount} of {totalCount} items checked
            </p>
          )}
        </div>
        <Button onClick={handleAddClick}>
          <Plus className="size-4 mr-2" />
          Add Grocery
        </Button>
      </div>

      <div className="mb-6">
        <WeekSelector value={weekFilter} onChange={setWeekFilter} />
      </div>

      {loading ? (
        <Card className="p-6">
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="h-12 bg-muted animate-pulse rounded-lg"
              />
            ))}
          </div>
        </Card>
      ) : sortedItems.length > 0 ? (
        <Card className="p-4">
          <div className="divide-y divide-border">
            {sortedItems.map((item) => (
              <CartItemRow
                key={item._id}
                item={item}
                onToggleChecked={handleToggleChecked}
                onEdit={handleEditClick}
                onDelete={handleDeleteItem}
              />
            ))}
          </div>
        </Card>
      ) : (
        <Card className="p-12 text-center">
          <ShoppingCart className="size-16 mx-auto mb-4 text-muted-foreground/30" />
          <h2 className="text-xl mb-2">Your cart is empty</h2>
          <p className="text-muted-foreground">
            Add meals to your plan or add groceries manually
          </p>
        </Card>
      )}

      <AddGroceryDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        editItem={editItem}
        onItemSaved={handleItemSaved}
      />
    </div>
  );
}
