"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  DndContext,
  type DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/components/ui/tabs";
import { DayCard } from "@/components/plan/day-card";
import type { ClientMealPlan } from "@/lib/types";

interface PlanPageContentProps {
  thisWeekPlan: ClientMealPlan;
  nextWeekPlan: ClientMealPlan;
  thisWeekStart: string;
  nextWeekStart: string;
  thisWeekLabel: string;
  nextWeekLabel: string;
}

function moveMealBetweenDays(
  plan: ClientMealPlan,
  fromDay: string,
  toDay: string,
  mealId: string
): ClientMealPlan {
  const source = plan.days.find((d) => d.day === fromDay);
  const meal = source?.meals.find((m) => m._id === mealId);
  if (!meal) return plan;

  return {
    ...plan,
    days: plan.days.map((d) => {
      if (d.day === fromDay) {
        return { ...d, meals: d.meals.filter((m) => m._id !== mealId) };
      }
      if (d.day === toDay) {
        return { ...d, meals: [...d.meals, meal] };
      }
      return d;
    }),
  };
}

export function PlanPageContent({
  thisWeekPlan,
  nextWeekPlan,
  thisWeekStart,
  nextWeekStart,
  thisWeekLabel,
  nextWeekLabel,
}: PlanPageContentProps) {
  const router = useRouter();
  const [activeWeek, setActiveWeek] = useState("this-week");
  const [thisWeek, setThisWeek] = useState(thisWeekPlan);
  const [nextWeek, setNextWeek] = useState(nextWeekPlan);

  useEffect(() => {
    setThisWeek(thisWeekPlan);
  }, [thisWeekPlan]);

  useEffect(() => {
    setNextWeek(nextWeekPlan);
  }, [nextWeekPlan]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor)
  );

  function handlePlanUpdated() {
    router.refresh();
  }

  const handleDragEnd = useCallback(
    (
      event: DragEndEvent,
      week: ClientMealPlan,
      setWeek: (plan: ClientMealPlan) => void
    ) => {
      const { active, over } = event;
      if (!over) return;

      const fromDay = active.data.current?.fromDay as string | undefined;
      const mealId = active.data.current?.mealId as string | undefined;
      const toDay = over.data.current?.day as string | undefined;

      if (!fromDay || !toDay || !mealId || fromDay === toDay) return;

      const previous = week;
      const optimistic = moveMealBetweenDays(week, fromDay, toDay, mealId);
      setWeek(optimistic);

      fetch(`/api/meals/${week._id}/move`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fromDay, toDay, mealId }),
      })
        .then(async (res) => {
          if (!res.ok) {
            const data = await res.json().catch(() => null);
            toast.error(data?.error ?? "Failed to move meal");
            setWeek(previous);
            router.refresh();
          }
        })
        .catch(() => {
          toast.error("Network error. Please try again.");
          setWeek(previous);
          router.refresh();
        });
    },
    [router]
  );

  return (
    <div className="max-w-7xl mx-auto px-6 pt-10 pb-16">
      <div className="mb-10">
        <h1 className="text-5xl font-headline font-extrabold tracking-tight text-foreground mb-3">
          Weekly <span className="italic text-primary">Fuel</span>.
        </h1>
        <p className="text-muted-foreground font-medium leading-relaxed">
          Your editorial meal guide for {thisWeekLabel}.
        </p>
      </div>

      <Tabs value={activeWeek} onValueChange={setActiveWeek} className="w-full">
        <TabsList className="mb-8 inline-flex h-auto rounded-full bg-muted p-1.5 gap-1">
          <TabsTrigger
            value="this-week"
            className="rounded-full px-6 py-2 font-headline font-bold text-sm tracking-tight data-[state=active]:signature-gradient data-[state=active]:text-white data-[state=inactive]:text-muted-foreground"
          >
            This Week ({thisWeekLabel})
          </TabsTrigger>
          <TabsTrigger
            value="next-week"
            className="rounded-full px-6 py-2 font-headline font-bold text-sm tracking-tight data-[state=active]:signature-gradient data-[state=active]:text-white data-[state=inactive]:text-muted-foreground"
          >
            Next Week ({nextWeekLabel})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="this-week" className="space-y-4">
          <DndContext
            id="plan-dnd-this-week"
            sensors={sensors}
            onDragEnd={(e) => handleDragEnd(e, thisWeek, setThisWeek)}
          >
            {thisWeek.days.map((dayPlan) => (
              <DayCard
                key={dayPlan.day}
                dayPlan={dayPlan}
                planId={thisWeek._id}
                weekStart={thisWeekStart}
                onPlanUpdated={handlePlanUpdated}
              />
            ))}
          </DndContext>
        </TabsContent>

        <TabsContent value="next-week" className="space-y-4">
          <DndContext
            id="plan-dnd-next-week"
            sensors={sensors}
            onDragEnd={(e) => handleDragEnd(e, nextWeek, setNextWeek)}
          >
            {nextWeek.days.map((dayPlan) => (
              <DayCard
                key={dayPlan.day}
                dayPlan={dayPlan}
                planId={nextWeek._id}
                weekStart={nextWeekStart}
                onPlanUpdated={handlePlanUpdated}
              />
            ))}
          </DndContext>
        </TabsContent>
      </Tabs>
    </div>
  );
}
