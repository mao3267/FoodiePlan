"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Users, Pencil, Trash2, GripVertical } from "lucide-react";
import { useDraggable } from "@dnd-kit/core";
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

  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    isDragging,
  } = useDraggable({
    id: `meal-${meal._id}`,
    data: { mealId: meal._id, fromDay: day },
  });

  const dragStyle = transform
    ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)` }
    : undefined;

  const ingredients = meal.ingredients;
  const seasonings = meal.seasonings ?? [];
  const totalItems = ingredients.length + seasonings.length;
  const hiddenCount = totalItems - INITIAL_INGREDIENT_COUNT;

  const ingredientsToShow = expanded
    ? ingredients
    : ingredients.slice(0, INITIAL_INGREDIENT_COUNT);
  const seasoningSlots = expanded
    ? seasonings.length
    : Math.max(0, INITIAL_INGREDIENT_COUNT - ingredients.length);
  const seasoningsToShow = seasonings.slice(0, seasoningSlots);

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
    <div
      ref={setNodeRef}
      style={dragStyle}
      className={`group rounded-3xl p-5 bg-card editorial-shadow hover:shadow-md transition-shadow ${
        isDragging ? "opacity-50" : ""
      }`}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-1.5 min-w-0">
          <button
            type="button"
            ref={setActivatorNodeRef}
            {...listeners}
            {...attributes}
            className="cursor-grab active:cursor-grabbing touch-none text-muted-foreground hover:text-primary shrink-0"
            aria-label="Drag to move meal"
          >
            <GripVertical className="size-4" />
          </button>
          <h3 className="font-headline font-bold text-lg leading-tight text-card-foreground truncate">
            {meal.name}
          </h3>
        </div>
        <div className="flex gap-1 shrink-0">
          <Button
            variant="ghost"
            size="icon"
            className="size-7 rounded-full"
            onClick={() => onEditClick(meal)}
          >
            <Pencil className="size-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="size-7 rounded-full text-destructive hover:text-destructive"
            onClick={handleDelete}
            disabled={deleting}
          >
            <Trash2 className="size-3.5" />
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-3 mb-3">
        <span className="inline-flex items-center bg-primary/10 text-primary px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">
          {meal.time}
        </span>
        <div className="flex items-center gap-1 text-muted-foreground text-xs">
          <Users className="size-3.5" />
          <span className="font-medium">{meal.servings}</span>
        </div>
      </div>

      {totalItems > 0 && (
        <div className="text-sm">
          {ingredientsToShow.length > 0 && (
            <>
              <p className="font-medium mb-1 text-card-foreground">Ingredients:</p>
              <ul className="space-y-0.5 text-muted-foreground">
                {ingredientsToShow.map((ingredient, idx) => (
                  <li key={`ing-${idx}`}>&#8226; {formatIngredient(ingredient)}</li>
                ))}
              </ul>
            </>
          )}
          {seasoningsToShow.length > 0 && (
            <>
              <p className="font-medium mb-1 mt-2 text-card-foreground">Seasonings:</p>
              <ul className="space-y-0.5 text-muted-foreground">
                {seasoningsToShow.map((seasoning, idx) => (
                  <li key={`sea-${idx}`}>&#8226; {seasoning.name}</li>
                ))}
              </ul>
            </>
          )}
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
