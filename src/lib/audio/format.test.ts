import { describe, expect, it } from "vitest";
import { formatDuration, parseRange } from "./format";

describe("formatDuration", () => {
  it("formats sub-minute durations", () => {
    expect(formatDuration(0)).toBe("0:00");
    expect(formatDuration(5)).toBe("0:05");
  });

  it("formats minutes and seconds", () => {
    expect(formatDuration(65)).toBe("1:05");
    expect(formatDuration(3661)).toBe("61:01");
  });

  it("handles invalid input", () => {
    expect(formatDuration(Number.NaN)).toBe("0:00");
    expect(formatDuration(-3)).toBe("0:00");
  });
});

describe("parseRange", () => {
  const size = 1000;

  it("returns null when there is no Range header", () => {
    expect(parseRange(null, size)).toBeNull();
  });

  it("parses a closed range", () => {
    expect(parseRange("bytes=0-99", size)).toEqual({ start: 0, end: 99 });
  });

  it("parses an open-ended range", () => {
    expect(parseRange("bytes=500-", size)).toEqual({ start: 500, end: 999 });
  });

  it("parses a suffix range", () => {
    expect(parseRange("bytes=-100", size)).toEqual({ start: 900, end: 999 });
  });

  it("clamps an end beyond the size", () => {
    expect(parseRange("bytes=900-5000", size)).toEqual({ start: 900, end: 999 });
  });

  it("rejects a start beyond the end of the file", () => {
    expect(parseRange("bytes=1000-1200", size)).toBe("invalid");
  });

  it("rejects a reversed range", () => {
    expect(parseRange("bytes=10-5", size)).toBe("invalid");
  });

  it("rejects malformed headers", () => {
    expect(parseRange("bytes=abc", size)).toBe("invalid");
    expect(parseRange("bytes=-", size)).toBe("invalid");
    expect(parseRange("items=0-10", size)).toBe("invalid");
  });
});
