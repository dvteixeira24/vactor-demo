/**
 * Reduces decoded audio samples to a fixed number of peak buckets for
 * waveform rendering. Uses absolute amplitude (so negatives count) and
 * rounds to three decimals to keep the stored JSON compact.
 */
export function downsamplePeaks(
  samples: Float32Array | number[],
  buckets = 1000,
): number[] {
  const total = samples.length;
  if (total === 0 || buckets <= 0) return [];

  const count = Math.min(buckets, total);
  const blockSize = total / count;
  const peaks: number[] = [];

  for (let i = 0; i < count; i += 1) {
    const start = Math.floor(i * blockSize);
    const end = Math.max(start + 1, Math.floor((i + 1) * blockSize));

    let peak = 0;
    for (let j = start; j < end && j < total; j += 1) {
      const value = Math.abs(samples[j]);
      if (value > peak) peak = value;
    }
    peaks.push(Math.round(peak * 1000) / 1000);
  }

  return peaks;
}
