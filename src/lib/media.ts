/**
 * URL for an object stored in R2. Media is served through the range-aware
 * worker route rather than exposed publicly, so keys stay opaque.
 */
export function mediaUrl(key: string | null | undefined): string | undefined {
  if (!key) return undefined;
  return `/api/media/${key
    .split("/")
    .map((part) => encodeURIComponent(part))
    .join("/")}`;
}

/** Public URL for a clip's audio stream. */
export function clipAudioUrl(clipId: string): string {
  return `/api/audio/${clipId}`;
}
