/** Formats a duration in seconds as m:ss. Invalid input renders as 0:00. */
export function formatDuration(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
  const total = Math.round(seconds);
  const minutes = Math.floor(total / 60);
  const remainder = total % 60;
  return `${minutes}:${remainder.toString().padStart(2, "0")}`;
}

export type ParsedRange =
  | { start: number; end: number }
  | "invalid"
  | null;

/**
 * Parses a single-range HTTP `Range` header against a known resource size.
 * Returns null when there is no header, "invalid" when the header cannot be
 * satisfied (caller should respond 416), or the inclusive byte range.
 */
export function parseRange(header: string | null, size: number): ParsedRange {
  if (!header) return null;

  const match = /^bytes=(\d*)-(\d*)$/.exec(header.trim());
  if (!match) return "invalid";

  const [, startStr, endStr] = match;
  if (startStr === "" && endStr === "") return "invalid";

  let start: number;
  let end: number;

  if (startStr === "") {
    const suffix = Number(endStr);
    if (!Number.isFinite(suffix) || suffix <= 0) return "invalid";
    start = Math.max(0, size - suffix);
    end = size - 1;
  } else {
    start = Number(startStr);
    end = endStr === "" ? size - 1 : Number(endStr);
  }

  if (!Number.isFinite(start) || !Number.isFinite(end)) return "invalid";
  if (start >= size || start > end) return "invalid";

  return { start, end: Math.min(end, size - 1) };
}
