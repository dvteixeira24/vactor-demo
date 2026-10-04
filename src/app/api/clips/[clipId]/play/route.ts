import { eq, sql } from "drizzle-orm";
import { getDb } from "@/db";
import { demoClips } from "@/db/schema";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ clipId: string }> },
) {
  const { clipId } = await params;
  const db = await getDb();

  const clip = (
    await db
      .select({ id: demoClips.id })
      .from(demoClips)
      .where(eq(demoClips.id, clipId))
      .limit(1)
  )[0];
  if (!clip) return new Response("Not found", { status: 404 });

  await db
    .update(demoClips)
    .set({ playCount: sql`${demoClips.playCount} + 1` })
    .where(eq(demoClips.id, clipId));

  return Response.json({ ok: true });
}
