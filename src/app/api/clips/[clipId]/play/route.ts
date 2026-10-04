import { eq, sql } from "drizzle-orm";
import { getDb } from "@/db";
import { demoClips } from "@/db/schema";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ clipId: string }> },
) {
  const { clipId } = await params;
  const db = await getDb();

  await db
    .update(demoClips)
    .set({ playCount: sql`${demoClips.playCount} + 1` })
    .where(eq(demoClips.id, clipId));

  return Response.json({ ok: true });
}
