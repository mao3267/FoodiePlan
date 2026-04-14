"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { useDroppable } from "@dnd-kit/core";
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

const DAY_ORDER: Record<string, number> = {
  Monday: 0,
  Tuesday: 1,
  Wednesday: 2,
  Thursday: 3,
  Friday: 4,
  Saturday: 5,
  Sunday: 6,
};

function formatDayDate(weekStart: string, day: string): string {
  const offset = DAY_ORDER[day] ?? 0;
  const [y, m, d] = weekStart.split("-").map(Number);
  const date = new Date(y, (m ?? 1) - 1, (d ?? 1) + offset);
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
  }).format(date);
}

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

  const { setNodeRef, isOver } = useDroppable({
    id: `day-${dayPlan.day}`,
    data: { day: dayPlan.day },
  });

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
      <section
        ref={setNodeRef}
        className={`bg-card text-card-foreground rounded-3xl editorial-shadow p-8 transition-shadow ${
          isOver ? "ring-2 ring-primary ring-offset-2 shadow-lg" : ""
        }`}
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-baseline gap-4">
            <h2 className="text-3xl font-headline font-bold tracking-tighter">
              {dayPlan.day}
            </h2>
            <span className="text-muted-foreground font-medium text-xs tracking-widest uppercase">
              {formatDayDate(weekStart, dayPlan.day)}
            </span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleAddClick}
            className="rounded-full bg-muted text-primary font-headline font-bold hover:bg-accent"
          >
            <Plus className="size-4 mr-1" />
            Add Meal
          </Button>
        </div>

        {dayPlan.meals.length === 0 ? (
          <p className="text-muted-foreground font-medium italic text-center py-8">
            No meals planned for this day
          </p>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[...dayPlan.meals]
              .sort((a, b) => MEAL_TIME_ORDER[a.time] - MEAL_TIME_ORDER[b.time])
              .map((meal) => (
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
      </section>

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
