import { describe, expect, it } from "vitest";
import { formatBudget } from "./jobs";

const base = { currency: "USD", rateType: "fixed" as const };

describe("formatBudget", () => {
  it("formats a min–max range", () => {
    expect(formatBudget({ ...base, budgetMin: 500, budgetMax: 1500 })).toBe(
      "USD 500–1500",
    );
  });

  it("formats a minimum-only budget", () => {
    expect(formatBudget({ ...base, budgetMin: 500, budgetMax: null })).toBe(
      "From USD 500",
    );
  });

  it("formats a maximum-only budget", () => {
    expect(formatBudget({ ...base, budgetMin: null, budgetMax: 800 })).toBe(
      "Up to USD 800",
    );
  });

  it("falls back when no budget is set", () => {
    expect(formatBudget({ ...base, budgetMin: null, budgetMax: null })).toBe(
      "Budget TBD",
    );
  });
});
