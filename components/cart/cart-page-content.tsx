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

  const sortByCheckedThenName = (a: ClientShoppingItem, b: ClientShoppingItem) => {
    if (a.checked !== b.checked) return a.checked ? 1 : -1;
    return a.name.localeCompare(b.name);
  };

  const foodItems = items
    .filter((i) => i.category !== "seasoning")
    .sort(sortByCheckedThenName);
  const seasoningItems = items
    .filter((i) => i.category === "seasoning")
    .sort(sortByCheckedThenName);

  const hasItems = items.length > 0;

  return (
    <div className="max-w-4xl mx-auto px-6 pt-10 pb-16">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-10">
        <div className="max-w-2xl">
          <h1 className="text-5xl font-headline font-extrabold tracking-tight text-foreground mb-3">
            Shopping <span className="italic text-primary">Cart</span>
          </h1>
          {totalCount > 0 ? (
            <p className="text-muted-foreground font-medium leading-relaxed">
              {checkedCount} of {totalCount} items checked.
            </p>
          ) : (
            <p className="text-muted-foreground font-medium leading-relaxed">
              Plan a meal or add groceries to fill up your list.
            </p>
          )}
        </div>
        <Button
          onClick={handleAddClick}
          className="signature-gradient text-white font-headline font-bold rounded-full px-6 py-5 self-start md:self-end hover:opacity-90 active:scale-95 transition-transform"
        >
          <Plus className="size-4 mr-2" />
          Add Grocery
        </Button>
      </div>

      <div className="mb-8">
        <WeekSelector value={weekFilter} onChange={setWeekFilter} />
      </div>

      {loading ? (
        <Card className="p-6">
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="h-12 bg-muted animate-pulse rounded-2xl"
              />
            ))}
          </div>
        </Card>
      ) : hasItems ? (
        <div className="space-y-8">
          {foodItems.length > 0 && (
            <section>
              <h2 className="text-2xl font-headline font-bold tracking-tight mb-4 ml-2">
                Food
              </h2>
              <Card className="p-4">
                <div className="divide-y divide-border/60">
                  {foodItems.map((item) => (
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
            </section>
          )}
          {seasoningItems.length > 0 && (
            <section>
              <h2 className="text-2xl font-headline font-bold tracking-tight mb-4 ml-2">
                Seasonings
              </h2>
              <Card className="p-4">
                <div className="divide-y divide-border/60">
                  {seasoningItems.map((item) => (
                    <CartItemRow
                      key={item._id}
                      item={item}
                      onToggleChecked={handleToggleChecked}
                      onEdit={handleEditClick}
                      onDelete={handleDeleteItem}
                      hideMeasurement
                    />
                  ))}
                </div>
              </Card>
            </section>
          )}
        </div>
      ) : (
        <section className="flex flex-col items-center justify-center py-12 text-center">
          <div className="relative w-full max-w-md mb-10">
            <div className="absolute inset-0 bg-secondary/40 rounded-[3rem] rotate-3 scale-110 -z-10"></div>
            <div className="aspect-square max-h-72 bg-card rounded-[2.5rem] editorial-shadow flex items-center justify-center p-8">
              <ShoppingCart className="size-24 text-primary/40" />
            </div>
          </div>
          <h2 className="font-headline text-4xl font-extrabold tracking-tight text-foreground mb-4">
            Your basket is <span className="italic text-primary">freshly</span> empty
          </h2>
          <p className="text-muted-foreground text-lg max-w-md mx-auto leading-relaxed">
            Add meals to your plan or add groceries manually to start stocking your list.
          </p>
        </section>
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
