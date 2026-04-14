"use client";

import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Bell, Mail } from "lucide-react";
import { MealTimePicker } from "@/components/settings/meal-time-picker";
import type {
  INotificationPreferences,
  IDefaultMealTimes,
  ReminderOffset,
  MealTime,
} from "@/lib/types";

interface NotificationsSectionProps {
  notifications: INotificationPreferences;
  defaultMealTimes: IDefaultMealTimes;
  onNotificationsChange: (notifications: INotificationPreferences) => void;
  onMealTimesChange: (mealTimes: IDefaultMealTimes) => void;
}

const MEAL_TIME_LABELS: Record<keyof IDefaultMealTimes, string> = {
  Breakfast: "Breakfast",
  Lunch: "Lunch",
  Dinner: "Dinner",
};

const REMINDER_OPTIONS: { value: ReminderOffset; label: string }[] = [
  { value: 10, label: "10 minutes before" },
  { value: 30, label: "30 minutes before" },
  { value: 60, label: "1 hour before" },
];

export function NotificationsSection({
  notifications,
  defaultMealTimes,
  onNotificationsChange,
  onMealTimesChange,
}: NotificationsSectionProps) {
  function handleToggle(field: "emailEnabled" | "pushEnabled") {
    onNotificationsChange({
      ...notifications,
      [field]: !notifications[field],
    });
  }

  function handleReminderChange(value: string) {
    onNotificationsChange({
      ...notifications,
      reminderOffset: Number(value) as ReminderOffset,
    });
  }

  function handleMealTimeChange(meal: keyof IDefaultMealTimes, value: string) {
    onMealTimesChange({
      ...defaultMealTimes,
      [meal]: value,
    });
  }

  return (
    <Card className="p-8">
      <h2 className="font-headline font-bold text-xl tracking-tight mb-6">Notifications</h2>

      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Mail className="size-5 text-primary" />
            <div>
              <p className="font-headline font-bold text-card-foreground">Email Notifications</p>
              <p className="text-xs font-medium text-muted-foreground mt-0.5">
                Receive updates about your meal plans
              </p>
            </div>
          </div>
          <Switch
            checked={notifications.emailEnabled}
            onCheckedChange={() => handleToggle("emailEnabled")}
          />
        </div>

        <Separator />

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Bell className="size-5 text-primary" />
            <div>
              <p className="font-headline font-bold text-card-foreground">Push Notifications</p>
              <p className="text-xs font-medium text-muted-foreground mt-0.5">
                Get notified about meal reminders
              </p>
            </div>
          </div>
          <Switch
            checked={notifications.pushEnabled}
            onCheckedChange={() => handleToggle("pushEnabled")}
          />
        </div>

        <Separator />

        <div>
          <p className="text-xs font-headline font-bold tracking-widest uppercase text-muted-foreground mb-3">Default Meal Times</p>
          <div className="space-y-3">
            {(Object.keys(MEAL_TIME_LABELS) as Array<keyof IDefaultMealTimes>).map(
              (meal) => (
                <MealTimePicker
                  key={meal}
                  label={MEAL_TIME_LABELS[meal]}
                  value={defaultMealTimes[meal]}
                  onChange={(value) => handleMealTimeChange(meal, value)}
                />
              )
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}
