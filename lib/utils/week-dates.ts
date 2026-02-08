import { startOfWeek, addWeeks } from "date-fns";

const WEEK_DAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
] as const;

/**
 * Returns the Monday 00:00:00 local time for the current week (offset=0)
 * or a future week (offset=1 for next week, etc.).
 */
export function getWeekStart(offset: number = 0): Date {
  const now = new Date();
  const monday = startOfWeek(now, { weekStartsOn: 1 });
  const target = offset === 0 ? monday : addWeeks(monday, offset);
  target.setHours(0, 0, 0, 0);
  return target;
}

/**
 * Returns an array of 7 day names starting from Monday.
 */
export function getWeekDays(): readonly string[] {
  return WEEK_DAYS;
}

/**
 * Formats a Date as a YYYY-MM-DD string using local date parts.
 */
export function formatWeekStart(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

const MS_PER_DAY = 86_400_000;

/**
 * Returns the 0-based index of today in the WEEK_DAYS array (Monday=0, Sunday=6).
 */
export function getTodayDayIndex(): number {
  return (new Date().getDay() + 6) % 7;
}

/**
 * Returns a human-readable label for a week start date.
 * Example: "Jan 27 – Feb 2"
 */
export function getWeekLabel(weekStart: Date): string {
  const weekEnd = new Date(weekStart.getTime() + 6 * MS_PER_DAY);
  const fmt = new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
  });
  return `${fmt.format(weekStart)} – ${fmt.format(weekEnd)}`;
}
