import { describe, it, expect } from "vitest";
import {
  getWeekStart,
  getWeekDays,
  formatWeekStart,
  getWeekLabel,
} from "@/lib/utils/week-dates";

describe("week-dates utility", () => {
  describe("getWeekStart", () => {
    it("returns a Monday for current week (offset=0)", () => {
      const monday = getWeekStart(0);
      expect(monday.getUTCDay()).toBe(1);
    });

    it("returns a Monday for next week (offset=1)", () => {
      const nextMonday = getWeekStart(1);
      expect(nextMonday.getUTCDay()).toBe(1);
    });

    it("next week start is 7 days after this week start", () => {
      const thisWeek = getWeekStart(0);
      const nextWeek = getWeekStart(1);
      const diffMs = nextWeek.getTime() - thisWeek.getTime();
      const diffDays = diffMs / (1000 * 60 * 60 * 24);
      expect(diffDays).toBe(7);
    });

    it("returns UTC midnight", () => {
      const monday = getWeekStart(0);
      expect(monday.getUTCHours()).toBe(0);
      expect(monday.getUTCMinutes()).toBe(0);
      expect(monday.getUTCSeconds()).toBe(0);
      expect(monday.getUTCMilliseconds()).toBe(0);
    });
  });

  describe("getWeekDays", () => {
    it("returns 7 day names", () => {
      const days = getWeekDays();
      expect(days).toHaveLength(7);
    });

    it("starts with Monday and ends with Sunday", () => {
      const days = getWeekDays();
      expect(days[0]).toBe("Monday");
      expect(days[6]).toBe("Sunday");
    });

    it("contains all 7 days of the week", () => {
      const days = getWeekDays();
      expect(days).toEqual([
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
        "Sunday",
      ]);
    });
  });

  describe("formatWeekStart", () => {
    it("formats a date as YYYY-MM-DD", () => {
      const date = new Date(Date.UTC(2025, 0, 27));
      expect(formatWeekStart(date)).toBe("2025-01-27");
    });
  });

  describe("getWeekLabel", () => {
    it("returns a range label for a week start date", () => {
      const date = new Date(Date.UTC(2025, 0, 27));
      const label = getWeekLabel(date);
      expect(label).toContain("Jan 27");
      expect(label).toContain("Feb 2");
    });
  });
});
