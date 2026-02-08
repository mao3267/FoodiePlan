"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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

  function handlePlanUpdated() {
    router.refresh();
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl">Meal Plan</h1>
      </div>

      <Tabs value={activeWeek} onValueChange={setActiveWeek} className="w-full">
        <TabsList className="grid w-full max-w-md mb-6 grid-cols-2">
          <TabsTrigger value="this-week">This Week ({thisWeekLabel})</TabsTrigger>
          <TabsTrigger value="next-week">Next Week ({nextWeekLabel})</TabsTrigger>
        </TabsList>

        <TabsContent value="this-week" className="space-y-4">
          {thisWeekPlan.days.map((dayPlan) => (
            <DayCard
              key={dayPlan.day}
              dayPlan={dayPlan}
              planId={thisWeekPlan._id}
              weekStart={thisWeekStart}
              onPlanUpdated={handlePlanUpdated}
            />
          ))}
        </TabsContent>

        <TabsContent value="next-week" className="space-y-4">
          {nextWeekPlan.days.map((dayPlan) => (
            <DayCard
              key={dayPlan.day}
              dayPlan={dayPlan}
              planId={nextWeekPlan._id}
              weekStart={nextWeekStart}
              onPlanUpdated={handlePlanUpdated}
            />
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
}
