import { describe, expect, it } from "vitest";
import { clipSchema } from "./clip";

describe("clipSchema", () => {
  it("accepts a valid clip", () => {
    const r = clipSchema.safeParse({
      title: "Commercial demo",
      category: "Commercial",
      durationSec: 12.5,
      peaks: [0.1, 0.5, 1],
    });
    expect(r.success).toBe(true);
  });

  it("rejects an unknown category", () => {
    const r = clipSchema.safeParse({
      title: "Demo",
      category: "Nonsense",
      durationSec: 1,
    });
    expect(r.success).toBe(false);
  });

  it("rejects a blank title", () => {
    const r = clipSchema.safeParse({
      title: "   ",
      category: "Commercial",
      durationSec: 1,
    });
    expect(r.success).toBe(false);
  });

  it("rejects peaks outside 0..1", () => {
    const r = clipSchema.safeParse({
      title: "Demo",
      category: "Commercial",
      durationSec: 1,
      peaks: [1.5],
    });
    expect(r.success).toBe(false);
  });
});
