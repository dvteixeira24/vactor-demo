import { getCloudflareContext } from "@opennextjs/cloudflare";

export * from "./upload-limits";

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
