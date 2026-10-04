"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { getDb } from "@/db";
import { demoClips, profiles } from "@/db/schema";
import { requireUser } from "@/lib/session";
import { isOwner } from "@/lib/authz";
import { deleteObject } from "@/lib/storage";

export type ActionResult =
  | { ok: true; message?: string }
  | { ok: false; error: string };

async function loadClipOwner(clipId: string) {
  const db = await getDb();
  const rows = await db
    .select({ clip: demoClips, ownerId: profiles.userId, handle: profiles.handle })
    .from(demoClips)
    .innerJoin(profiles, eq(demoClips.profileId, profiles.id))
    .where(eq(demoClips.id, clipId))
    .limit(1);
  return { db, row: rows[0] ?? null };
}

export async function deleteClip(clipId: string): Promise<ActionResult> {
  const user = await requireUser("/dashboard/clips");
  const { db, row } = await loadClipOwner(clipId);
  if (!row) return { ok: false, error: "Clip not found." };
  if (!isOwner(row.ownerId, user.id)) {
    return { ok: false, error: "You can only delete your own clips." };
  }

  // Delete the row first: an orphaned R2 object is preferable to a clip row
  // whose audio has been removed.
  await db.delete(demoClips).where(eq(demoClips.id, clipId));
  await deleteObject(row.clip.audioKey).catch(() => undefined);

  revalidatePath("/dashboard/clips");
  revalidatePath("/dashboard");
  revalidatePath("/");
  revalidatePath(`/actors/${row.handle}`);
  return { ok: true, message: "Clip deleted." };
}
