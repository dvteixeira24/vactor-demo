import { describe, expect, it } from "vitest";
import { profileSchema } from "./profile";

describe("profileSchema", () => {
  it("accepts a minimal valid profile", () => {
    const r = profileSchema.safeParse({ displayName: "Jordan Rivera" });
    expect(r.success).toBe(true);
  });

  it("rejects a too-short display name", () => {
    const r = profileSchema.safeParse({ displayName: "J" });
    expect(r.success).toBe(false);
  });

  it("rejects an invalid website URL", () => {
    const r = profileSchema.safeParse({
      displayName: "Jordan Rivera",
      websiteUrl: "not-a-url",
    });
    expect(r.success).toBe(false);
  });

  it("allows an empty website URL", () => {
    const r = profileSchema.safeParse({
      displayName: "Jordan Rivera",
      websiteUrl: "",
    });
    expect(r.success).toBe(true);
  });

  it("coerces years of experience from a string", () => {
    const r = profileSchema.safeParse({
      displayName: "Jordan Rivera",
      yearsExperience: "5",
    });
    expect(r.success && r.data.yearsExperience).toBe(5);
  });

  it("defaults array fields to empty arrays", () => {
    const r = profileSchema.parse({ displayName: "Jordan Rivera" });
    expect(r.languages).toEqual([]);
    expect(r.voiceTags).toEqual([]);
  });
});
