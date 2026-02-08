"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MealCard } from "@/components/plan/meal-card";
import { AddMealDialog } from "@/components/plan/add-meal-dialog";
import type { ClientDayPlan, ClientMeal, MealTime } from "@/lib/types";

const MEAL_TIME_ORDER: Record<MealTime, number> = {
  Breakfast: 0,
  Lunch: 1,
  Dinner: 2,
  Snack: 3,
};

interface DayCardProps {
  dayPlan: ClientDayPlan;
  planId: string;
  weekStart: string;
  onPlanUpdated: () => void;
}

export function DayCard({
  dayPlan,
  planId,
  weekStart,
  onPlanUpdated,
}: DayCardProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editMeal, setEditMeal] = useState<ClientMeal | null>(null);

  function handleAddClick() {
    setEditMeal(null);
    setDialogOpen(true);
  }

  function handleEditClick(meal: ClientMeal) {
    setEditMeal(meal);
    setDialogOpen(true);
  }

  function handleMealDeleted() {
    onPlanUpdated();
  }

  return (
    <>
      <Card className="p-6 bg-card text-card-foreground">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">{dayPlan.day}</h2>
          <Button variant="outline" size="sm" onClick={handleAddClick}>
            <Plus className="size-4 mr-2" />
            Add Meal
          </Button>
        </div>

        {dayPlan.meals.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">
            No meals planned for this day
          </p>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[...dayPlan.meals].sort((a, b) => MEAL_TIME_ORDER[a.time] - MEAL_TIME_ORDER[b.time]).map((meal) => (
              <MealCard
                key={meal._id}
                meal={meal}
                planId={planId}
                day={dayPlan.day}
                onMealDeleted={handleMealDeleted}
                onEditClick={handleEditClick}
              />
            ))}
          </div>
        )}
      </Card>

      <AddMealDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        day={dayPlan.day}
        weekStart={weekStart}
        planId={planId}
        editMeal={editMeal}
        onMealAdded={onPlanUpdated}
      />
    </>
  );
}
