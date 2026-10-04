import { eq } from "drizzle-orm";
import { getDb } from "@/db";
import { profiles, type Profile } from "@/db/schema";
import { slugifyHandle, uniqueHandle } from "@/lib/handles";

/**
 * Loads the given user's profile, creating a minimal one if absent.
 *
 * NOT a server action: this lives outside any `"use server"` module so it is
 * never exposed as a public endpoint. Callers must resolve the user id from a
 * trusted session (see `requireUser`).
 */
export async function getOrCreateProfile(
  userId: string,
  displayName: string,
): Promise<Profile> {
  const db = await getDb();
  const existing = await db
    .select()
    .from(profiles)
    .where(eq(profiles.userId, userId))
    .limit(1);
  if (existing[0]) return existing[0];

  const taken = new Set(
    (await db.select({ handle: profiles.handle }).from(profiles)).map(
      (r) => r.handle,
    ),
  );
  const handle = uniqueHandle(slugifyHandle(displayName), taken);
  const id = crypto.randomUUID();

  await db.insert(profiles).values({
    id,
    userId,
    handle,
    displayName,
    isPublished: false,
  });

  const created = await db
    .select()
    .from(profiles)
    .where(eq(profiles.id, id))
    .limit(1);
  return created[0];
}
