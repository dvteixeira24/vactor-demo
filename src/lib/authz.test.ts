import { describe, expect, it } from "vitest";
import { isOwner } from "./authz";

describe("isOwner", () => {
  it("is true when the ids match", () => {
    expect(isOwner("user-1", "user-1")).toBe(true);
  });

  it("is false when the ids differ", () => {
    expect(isOwner("user-1", "user-2")).toBe(false);
  });

  it("is false when either id is missing", () => {
    expect(isOwner(null, "user-1")).toBe(false);
    expect(isOwner("user-1", undefined)).toBe(false);
  });
});
