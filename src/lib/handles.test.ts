import { describe, expect, it } from "vitest";
import { slugifyHandle, uniqueHandle } from "./handles";

describe("slugifyHandle", () => {
  it("lowercases and hyphenates a display name", () => {
    expect(slugifyHandle("Jordan Rivera")).toBe("jordan-rivera");
  });

  it("strips punctuation and collapses separators", () => {
    expect(slugifyHandle("  Maya O'Neil!! ")).toBe("maya-oneil");
  });

  it("strips diacritics", () => {
    expect(slugifyHandle("Renée Dubois")).toBe("renee-dubois");
  });

  it("falls back to 'actor' when nothing usable remains", () => {
    expect(slugifyHandle("!!!")).toBe("actor");
  });

  it("caps the length at 30 characters", () => {
    expect(slugifyHandle("a".repeat(50)).length).toBe(30);
  });
});

describe("uniqueHandle", () => {
  it("returns the base when it is free", () => {
    expect(uniqueHandle("jordan", new Set())).toBe("jordan");
  });

  it("appends the smallest free numeric suffix when taken", () => {
    expect(uniqueHandle("jordan", new Set(["jordan", "jordan-2"]))).toBe(
      "jordan-3",
    );
  });
});
