import { getObject } from "@/lib/storage";

// Only public image namespaces are served; clip audio goes through /api/audio.
const ALLOWED_PREFIXES = ["avatars/", "covers/"];

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ key: string[] }> },
) {
  const { key } = await params;

  let objectKey: string;
  try {
    objectKey = key.map(decodeURIComponent).join("/");
  } catch {
    return new Response("Bad request", { status: 400 });
  }

  if (
    objectKey.includes("..") ||
    !ALLOWED_PREFIXES.some((prefix) => objectKey.startsWith(prefix))
  ) {
    return new Response("Not found", { status: 404 });
  }

  const object = await getObject(objectKey);
  if (!object) return new Response("Not found", { status: 404 });

  const headers = new Headers();
  object.writeHttpMetadata(headers);
  headers.set("etag", object.httpEtag);
  headers.set("cache-control", "public, max-age=31536000, immutable");
  headers.set("x-content-type-options", "nosniff");

  return new Response(object.body, { headers });
}
