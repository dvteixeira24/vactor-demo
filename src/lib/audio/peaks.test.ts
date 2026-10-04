import { describe, expect, it } from "vitest";
import { downsamplePeaks } from "./peaks";

describe("downsamplePeaks", () => {
  it("returns an empty array for empty input", () => {
    expect(downsamplePeaks(new Float32Array([]))).toEqual([]);
  });

  it("never returns more than the requested number of buckets", () => {
    const samples = new Float32Array(5000).fill(0.5);
    expect(downsamplePeaks(samples, 100).length).toBe(100);
  });

  it("captures the peak amplitude within each bucket", () => {
    const samples = new Float32Array([0, 0.2, 0.9, 0.1, 0.3, 0.4]);
    // 3 buckets: [0,0.2] [0.9,0.1] [0.3,0.4]
    expect(downsamplePeaks(samples, 3)).toEqual([0.2, 0.9, 0.4]);
  });

  it("uses absolute amplitude, so negatives count as peaks", () => {
    const samples = new Float32Array([-0.8, 0.1]);
    expect(downsamplePeaks(samples, 2)).toEqual([0.8, 0.1]);
  });

  it("rounds to three decimals and stays within [0, 1]", () => {
    const samples = new Float32Array([0.123456, 0.987654]);
    const peaks = downsamplePeaks(samples, 2);
    expect(peaks).toEqual([0.123, 0.988]);
    for (const p of peaks) {
      expect(p).toBeGreaterThanOrEqual(0);
      expect(p).toBeLessThanOrEqual(1);
    }
  });
});
