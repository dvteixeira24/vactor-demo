import { describe, expect, it } from "vitest";
import { offerSchema } from "./offer";

describe("offerSchema", () => {
  it("accepts a valid offer", () => {
    const r = offerSchema.safeParse({
      jobId: "job-1",
      rateAmount: 450,
      rateType: "fixed",
      currency: "USD",
      message: "I'd love to voice this.",
    });
    expect(r.success).toBe(true);
  });

  it("rejects a zero rate", () => {
    const r = offerSchema.safeParse({
      jobId: "job-1",
      rateAmount: 0,
      rateType: "fixed",
    });
    expect(r.success).toBe(false);
  });

  it("rejects an unknown rate type", () => {
    const r = offerSchema.safeParse({
      jobId: "job-1",
      rateAmount: 100,
      rateType: "monthly",
    });
    expect(r.success).toBe(false);
  });

  it("coerces a string rate", () => {
    const r = offerSchema.safeParse({
      jobId: "job-1",
      rateAmount: "300",
      rateType: "hourly",
    });
    expect(r.success && r.data.rateAmount).toBe(300);
  });

  it("defaults currency to USD", () => {
    const r = offerSchema.parse({
      jobId: "job-1",
      rateAmount: 100,
      rateType: "fixed",
    });
    expect(r.currency).toBe("USD");
  });
});
