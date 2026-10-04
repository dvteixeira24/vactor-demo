import { getCloudflareContext } from "@opennextjs/cloudflare";

/* ------------------------------- constants -------------------------------- */

export const IMAGE_EXT: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/avif": "avif",
  "image/gif": "gif",
};

export const AUDIO_EXT: Record<string, string> = {
  "audio/mpeg": "mp3",
  "audio/wav": "wav",
  "audio/x-wav": "wav",
  "audio/mp4": "m4a",
  "audio/x-m4a": "m4a",
  "audio/ogg": "ogg",
  "audio/webm": "webm",
  "audio/aac": "aac",
};

export const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
export const MAX_AUDIO_BYTES = 25 * 1024 * 1024;

export type FileMeta = { type: string; size: number };
export type Validation = { ok: true } | { ok: false; error: string };

/* --------------------------------- keys ----------------------------------- */

export function extFromMime(mime: string): string | null {
  return IMAGE_EXT[mime] ?? null;
}

export function audioExtFromMime(mime: string): string | null {
  return AUDIO_EXT[mime] ?? null;
}

export function imageKey(
  userId: string,
  kind: "avatar" | "cover",
  ext: string,
): string {
  const prefix = kind === "avatar" ? "avatars" : "covers";
  return `${prefix}/${userId}/${crypto.randomUUID()}.${ext}`;
}

export function clipAudioKey(
  userId: string,
  clipId: string,
  ext: string,
): string {
  return `clips/${userId}/${clipId}.${ext}`;
}

/* ------------------------------ validation -------------------------------- */

export function validateImage(file: FileMeta): Validation {
  if (!IMAGE_EXT[file.type]) {
    return { ok: false, error: "Unsupported image type (use JPG, PNG, WebP, AVIF, or GIF)" };
  }
  if (file.size > MAX_IMAGE_BYTES) {
    return { ok: false, error: "Image must be 5 MB or smaller" };
  }
  return { ok: true };
}

export function validateAudio(file: FileMeta): Validation {
  if (!AUDIO_EXT[file.type]) {
    return { ok: false, error: "Unsupported audio format (use MP3, WAV, M4A, OGG, or WebM)" };
  }
  if (file.size > MAX_AUDIO_BYTES) {
    return { ok: false, error: "Clip must be 25 MB or smaller" };
  }
  return { ok: true };
}

/* --------------------------------- R2 ------------------------------------- */

export type MediaBucket = R2Bucket;

export async function getMediaBucket(): Promise<MediaBucket> {
  const { env } = await getCloudflareContext({ async: true });
  return env.AUDIO;
}

export async function putObject(
  key: string,
  body: ReadableStream | ArrayBuffer | ArrayBufferView | string | Blob,
  contentType: string,
): Promise<void> {
  const bucket = await getMediaBucket();
  await bucket.put(key, body as ArrayBuffer, {
    httpMetadata: { contentType },
  });
}

export async function deleteObject(key: string): Promise<void> {
  const bucket = await getMediaBucket();
  await bucket.delete(key);
}

/** Fetch an object, optionally a byte range (for audio seeking). */
export async function getObject(
  key: string,
  range?: { offset: number; length: number },
): Promise<R2ObjectBody | null> {
  const bucket = await getMediaBucket();
  return bucket.get(key, range ? { range } : undefined);
}
