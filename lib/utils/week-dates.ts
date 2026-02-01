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
 * Returns the Monday 00:00:00 UTC for the current week (offset=0)
 * or a future week (offset=1 for next week, etc.).
 */
export function getWeekStart(offset: number = 0): Date {
  const now = new Date();
  const monday = startOfWeek(now, { weekStartsOn: 1 });
  const target = offset === 0 ? monday : addWeeks(monday, offset);
  target.setUTCHours(0, 0, 0, 0);
  return target;
}

/**
 * Returns an array of 7 day names starting from Monday.
 */
export function getWeekDays(): readonly string[] {
  return WEEK_DAYS;
}

/**
 * Formats a Date as an ISO date string (YYYY-MM-DD) for API usage.
 * Uses toISOString() to ensure UTC-based formatting.
 */
export function formatWeekStart(date: Date): string {
  return date.toISOString().slice(0, 10);
}

const MS_PER_DAY = 86_400_000;

/**
 * Returns a human-readable label for a week start date.
 * Uses Intl.DateTimeFormat with UTC timezone for consistent formatting.
 * Example: "Jan 27 – Feb 2"
 */
export function getWeekLabel(weekStart: Date): string {
  const weekEnd = new Date(weekStart.getTime() + 6 * MS_PER_DAY);
  const fmt = new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });
  return `${fmt.format(weekStart)} – ${fmt.format(weekEnd)}`;
}
