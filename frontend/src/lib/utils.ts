import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Formats an ISO-like date/time string to a local date label.
 * Accepts backend `LocalDateTime` (e.g. 2025-12-21T00:00:00) and `Instant` (e.g. 2025-12-21T10:15:30Z).
 */
export function formatLocalDate(value?: string | null): string {
  if (!value) return "";

  // If backend sends LocalDateTime, prefer the date part directly.
  const ymd = String(value).slice(0, 10);
  if (/^\d{4}-\d{2}-\d{2}$/.test(ymd)) return ymd;

  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? String(value) : d.toLocaleDateString();
}

/**
 * Formats an ISO timestamp to a local date+time label (no explicit timezone suffix in UI).
 */
export function formatLocalDateTime(value?: string | null): string {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return String(value);
  return d.toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}
