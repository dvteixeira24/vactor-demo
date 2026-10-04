"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { getDb } from "@/db";
import { profiles, type Profile } from "@/db/schema";
import { requireUser } from "@/lib/session";
import { profileSchema } from "@/lib/validators/profile";
import { slugifyHandle, uniqueHandle } from "@/lib/handles";

export type ActionResult =
  | { ok: true; message?: string }
  | { ok: false; error: string };

/** Loads the signed-in user's profile, creating a minimal one if absent. */
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

/** Updates the signed-in user's profile after validation. */
export async function updateProfile(input: unknown): Promise<ActionResult> {
  const user = await requireUser("/dashboard/profile");
  const parsed = profileSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Invalid profile details",
    };
  }

  const db = await getDb();
  const profile = await getOrCreateProfile(user.id, user.name);
  const data = parsed.data;

  await db
    .update(profiles)
    .set({
      displayName: data.displayName,
      tagline: data.tagline || null,
      bio: data.bio || null,
      location: data.location || null,
      accent: data.accent || null,
      websiteUrl: data.websiteUrl || null,
      yearsExperience: data.yearsExperience ?? null,
      languages: data.languages,
      voiceTags: data.voiceTags,
      socials: data.socials,
      isPublished: data.isPublished,
    })
    .where(eq(profiles.id, profile.id));

  revalidatePath("/dashboard/profile");
  revalidatePath("/dashboard");
  revalidatePath("/actors");
  revalidatePath(`/actors/${profile.handle}`);
  return { ok: true, message: "Profile saved." };
}

/** Sets (or clears) the avatar or cover image key for the signed-in user. */
export async function setProfileImage(
  kind: "avatar" | "cover",
  key: string | null,
): Promise<ActionResult> {
  const user = await requireUser("/dashboard/profile");
  const db = await getDb();
  const profile = await getOrCreateProfile(user.id, user.name);

  await db
    .update(profiles)
    .set(kind === "avatar" ? { avatarKey: key } : { coverKey: key })
    .where(eq(profiles.id, profile.id));

  revalidatePath("/dashboard/profile");
  revalidatePath(`/actors/${profile.handle}`);
  return { ok: true };
}
