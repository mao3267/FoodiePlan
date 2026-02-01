"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Plus } from "lucide-react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { IngredientRow } from "@/components/plan/ingredient-row";
import type { ClientMeal, ClientMealIngredient, MealTime } from "@/lib/types";

interface AddMealDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  day: string;
  weekStart: string;
  planId: string;
  editMeal?: ClientMeal | null;
  onMealAdded: () => void;
}

const MEAL_TIMES: MealTime[] = ["Breakfast", "Lunch", "Dinner", "Snack"];

const BLANK_INGREDIENT: ClientMealIngredient = { name: "", quantity: 1, unit: "" };

interface FormState {
  name: string;
  time: MealTime;
  servings: number;
  ingredients: ClientMealIngredient[];
}

const INITIAL_FORM: FormState = {
  name: "",
  time: "Breakfast",
  servings: 1,
  ingredients: [],
};

export function AddMealDialog({
  open,
  onOpenChange,
  day,
  weekStart,
  planId,
  editMeal,
  onMealAdded,
}: AddMealDialogProps) {
  const [form, setForm] = useState<FormState>(INITIAL_FORM);
  const [submitting, setSubmitting] = useState(false);

  const isEditMode = !!editMeal;

  useEffect(() => {
    if (editMeal) {
      setForm({
        name: editMeal.name,
        time: editMeal.time,
        servings: editMeal.servings,
        ingredients: editMeal.ingredients.length > 0
          ? editMeal.ingredients.map((ing) => ({ ...ing }))
          : [],
      });
    } else {
      setForm(INITIAL_FORM);
    }
  }, [editMeal, open]);

  function updateField<K extends keyof FormState>(
    key: K,
    value: FormState[K]
  ) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function handleIngredientUpdate(
    index: number,
    field: "name" | "quantity" | "unit",
    value: string | number
  ) {
    setForm((prev) => ({
      ...prev,
      ingredients: prev.ingredients.map((ing, i) =>
        i === index ? { ...ing, [field]: value } : ing
      ),
    }));
  }

  function handleIngredientRemove(index: number) {
    setForm((prev) => ({
      ...prev,
      ingredients: prev.ingredients.filter((_, i) => i !== index),
    }));
  }

  function handleAddIngredient() {
    setForm((prev) => ({
      ...prev,
      ingredients: [...prev.ingredients, { ...BLANK_INGREDIENT }],
    }));
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!form.name.trim()) return;

    setSubmitting(true);

    const ingredients = form.ingredients
      .filter((ing) => ing.name.trim())
      .map((ing) => ({
        name: ing.name.trim(),
        quantity: ing.quantity,
        unit: ing.unit.trim(),
      }));

    try {
      if (isEditMode && editMeal) {
        const res = await fetch(`/api/meals/${planId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            day,
            mealId: editMeal._id,
            updates: {
              name: form.name.trim(),
              time: form.time,
              servings: form.servings,
              ingredients,
            },
          }),
        });
        if (res.ok) {
          onMealAdded();
          onOpenChange(false);
        } else {
          const data = await res.json().catch(() => null);
          toast.error(data?.error ?? "Failed to update meal");
        }
      } else {
        const res = await fetch("/api/meals", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            weekStart,
            day,
            meal: {
              name: form.name.trim(),
              time: form.time,
              servings: form.servings,
              ingredients,
            },
          }),
        });
        if (res.ok) {
          onMealAdded();
          onOpenChange(false);
        } else {
          const data = await res.json().catch(() => null);
          toast.error(data?.error ?? "Failed to add meal");
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
      <DialogContent className="max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditMode ? "Edit Meal" : `Add Meal to ${day}`}
          </DialogTitle>
          <DialogDescription className="sr-only">
            {isEditMode
              ? "Update the details of this meal"
              : "Add a new meal to your plan"}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="meal-name">Meal Name</Label>
            <Input
              id="meal-name"
              placeholder="e.g., Grilled Chicken"
              value={form.name}
              onChange={(e) => updateField("name", e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="meal-time">Meal Time</Label>
            <Select
              value={form.time}
              onValueChange={(val) => updateField("time", val as MealTime)}
            >
              <SelectTrigger id="meal-time">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {MEAL_TIMES.map((t) => (
                  <SelectItem key={t} value={t}>
                    {t}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="meal-servings">Servings</Label>
            <Input
              id="meal-servings"
              type="number"
              min={1}
              value={form.servings}
              onChange={(e) =>
                updateField("servings", Math.max(1, parseInt(e.target.value) || 1))
              }
            />
          </div>

          <div className="space-y-2">
            <Label>Ingredients</Label>
            <div className="space-y-2">
              {form.ingredients.map((ing, idx) => (
                <IngredientRow
                  key={idx}
                  ingredient={ing}
                  index={idx}
                  onUpdate={handleIngredientUpdate}
                  onRemove={handleIngredientRemove}
                />
              ))}
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="w-full"
              onClick={handleAddIngredient}
            >
              <Plus className="size-4 mr-1" />
              Add Ingredient
            </Button>
          </div>

          <Button type="submit" className="w-full" disabled={submitting}>
            {isEditMode ? "Update Meal" : "Add Meal"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
