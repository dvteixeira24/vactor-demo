import { eq } from "drizzle-orm";
import { getDb } from "@/db";
import { demoClips } from "@/db/schema";
import { parseRange } from "@/lib/audio/format";
import { getObject } from "@/lib/storage";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ clipId: string }> },
) {
  const { clipId } = await params;

  const db = await getDb();
  const clip = (
    await db.select().from(demoClips).where(eq(demoClips.id, clipId)).limit(1)
  )[0];

  if (!clip) return new Response("Not found", { status: 404 });

  const size = clip.fileSize;
  const parsed = parseRange(request.headers.get("range"), size);

  const baseHeaders = {
    "content-type": clip.mimeType,
    "accept-ranges": "bytes",
    "cache-control": "public, max-age=3600",
  };

  if (parsed === "invalid") {
    return new Response("Range Not Satisfiable", {
      status: 416,
      headers: { ...baseHeaders, "content-range": `bytes */${size}` },
    });
  }

  if (parsed === null) {
    const object = await getObject(clip.audioKey);
    if (!object) return new Response("Not found", { status: 404 });
    return new Response(object.body, {
      status: 200,
      headers: {
        ...baseHeaders,
        "content-length": String(object.size),
        etag: object.httpEtag,
      },
    });
  }

  const { start, end } = parsed;
  const object = await getObject(clip.audioKey, {
    offset: start,
    length: end - start + 1,
  });
  if (!object) return new Response("Not found", { status: 404 });

  return new Response(object.body, {
    status: 206,
    headers: {
      ...baseHeaders,
      "content-range": `bytes ${start}-${end}/${size}`,
      "content-length": String(end - start + 1),
      etag: object.httpEtag,
    },
  });
}
