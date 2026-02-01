"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Clock, Users, Pencil, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatIngredient } from "@/lib/utils/format-ingredient";
import type { ClientMeal } from "@/lib/types";

interface MealCardProps {
  meal: ClientMeal;
  planId: string;
  day: string;
  onMealDeleted: (mealId: string) => void;
  onEditClick: (meal: ClientMeal) => void;
}

const INITIAL_INGREDIENT_COUNT = 3;

export function MealCard({
  meal,
  planId,
  day,
  onMealDeleted,
  onEditClick,
}: MealCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const visibleIngredients = expanded
    ? meal.ingredients
    : meal.ingredients.slice(0, INITIAL_INGREDIENT_COUNT);
  const hiddenCount = meal.ingredients.length - INITIAL_INGREDIENT_COUNT;

  async function handleDelete() {
    setDeleting(true);
    try {
      const res = await fetch(`/api/meals/${planId}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ day, mealId: meal._id }),
      });
      if (res.ok) {
        onMealDeleted(meal._id);
      } else {
        const data = await res.json().catch(() => null);
        toast.error(data?.error ?? "Failed to delete meal");
      }
    } catch {
      toast.error("Network error. Please try again.");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="border border-border rounded-lg p-4 hover:shadow-md transition-shadow bg-card">
      <div className="flex items-start justify-between mb-2">
        <h3 className="font-semibold text-card-foreground">{meal.name}</h3>
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="size-7"
            onClick={() => onEditClick(meal)}
          >
            <Pencil className="size-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="size-7 text-destructive hover:text-destructive"
            onClick={handleDelete}
            disabled={deleting}
          >
            <Trash2 className="size-3.5" />
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-3 text-sm text-muted-foreground mb-3">
        <Badge variant="secondary" className="gap-1">
          <Clock className="size-3" />
          {meal.time}
        </Badge>
        <div className="flex items-center gap-1">
          <Users className="size-3.5" />
          <span>{meal.servings}</span>
        </div>
      </div>

      {meal.ingredients.length > 0 && (
        <div className="text-sm">
          <p className="font-medium mb-1 text-card-foreground">Ingredients:</p>
          <ul className="space-y-0.5 text-muted-foreground">
            {visibleIngredients.map((ingredient, idx) => (
              <li key={idx}>&#8226; {formatIngredient(ingredient)}</li>
            ))}
          </ul>
          {hiddenCount > 0 && !expanded && (
            <button
              onClick={() => setExpanded(true)}
              className="text-primary text-sm mt-1 hover:underline"
            >
              +{hiddenCount} more
            </button>
          )}
          {expanded && hiddenCount > 0 && (
            <button
              onClick={() => setExpanded(false)}
              className="text-primary text-sm mt-1 hover:underline"
            >
              Show less
            </button>
          )}
        </div>
      )}
    </div>
  );
}
