import { describe, it, expect, vi, afterEach } from "vitest";
import { formatDate, formatRelativeTime } from "../formatters/date";

describe("formatDate", () => {
  const testDate = new Date("2024-06-15T12:00:00Z");

  it("should format with 'short' format (default)", () => {
    const result = formatDate(testDate, "short");
    // Korean short format includes year, 2-digit month, 2-digit day
    expect(result).toContain("2024");
    expect(result).toContain("06");
    expect(result).toContain("15");
  });

  it("should format with 'long' format", () => {
    const result = formatDate(testDate, "long");
    // Korean long format includes year, full month name, day, weekday
    expect(result).toContain("2024");
  });

  it("should format with 'iso' format", () => {
    const result = formatDate(testDate, "iso");
    expect(result).toBe("2024-06-15T12:00:00.000Z");
  });

  it("should default to 'short' format when no format specified", () => {
    const resultDefault = formatDate(testDate);
    const resultShort = formatDate(testDate, "short");
    expect(resultDefault).toBe(resultShort);
  });

  it("should handle string date input", () => {
    const result = formatDate("2024-06-15T12:00:00Z", "iso");
    expect(result).toBe("2024-06-15T12:00:00.000Z");
  });

  it("should handle Date object input", () => {
    const date = new Date("2024-01-01T00:00:00Z");
    const result = formatDate(date, "iso");
    expect(result).toBe("2024-01-01T00:00:00.000Z");
  });
});

describe("formatRelativeTime", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("should return '방금 전' for less than 60 seconds ago", () => {
    vi.useFakeTimers();
    const now = new Date("2024-06-15T12:00:30Z");
    vi.setSystemTime(now);
    const date = new Date("2024-06-15T12:00:00Z");
    expect(formatRelativeTime(date)).toBe("방금 전");
  });

  it("should return 'X분 전' for minutes ago", () => {
    vi.useFakeTimers();
    const now = new Date("2024-06-15T12:05:00Z");
    vi.setSystemTime(now);
    const date = new Date("2024-06-15T12:00:00Z");
    expect(formatRelativeTime(date)).toBe("5분 전");
  });

  it("should return 'X시간 전' for hours ago", () => {
    vi.useFakeTimers();
    const now = new Date("2024-06-15T15:00:00Z");
    vi.setSystemTime(now);
    const date = new Date("2024-06-15T12:00:00Z");
    expect(formatRelativeTime(date)).toBe("3시간 전");
  });

  it("should return 'X일 전' for days ago (less than 7)", () => {
    vi.useFakeTimers();
    const now = new Date("2024-06-18T12:00:00Z");
    vi.setSystemTime(now);
    const date = new Date("2024-06-15T12:00:00Z");
    expect(formatRelativeTime(date)).toBe("3일 전");
  });

  it("should return 'X주 전' for weeks ago (less than 30 days)", () => {
    vi.useFakeTimers();
    const now = new Date("2024-06-29T12:00:00Z");
    vi.setSystemTime(now);
    const date = new Date("2024-06-15T12:00:00Z");
    expect(formatRelativeTime(date)).toBe("2주 전");
  });

  it("should return 'X개월 전' for months ago (less than 365 days)", () => {
    vi.useFakeTimers();
    const now = new Date("2024-09-15T12:00:00Z");
    vi.setSystemTime(now);
    const date = new Date("2024-06-15T12:00:00Z");
    expect(formatRelativeTime(date)).toBe("3개월 전");
  });

  it("should return 'X년 전' for years ago", () => {
    vi.useFakeTimers();
    const now = new Date("2026-06-15T12:00:00Z");
    vi.setSystemTime(now);
    const date = new Date("2024-06-15T12:00:00Z");
    expect(formatRelativeTime(date)).toBe("2년 전");
  });

  it("should handle string date input", () => {
    vi.useFakeTimers();
    const now = new Date("2024-06-15T12:05:00Z");
    vi.setSystemTime(now);
    expect(formatRelativeTime("2024-06-15T12:00:00Z")).toBe("5분 전");
  });
});
