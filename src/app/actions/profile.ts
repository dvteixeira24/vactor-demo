"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { getDb } from "@/db";
import { profiles } from "@/db/schema";
import { requireUser } from "@/lib/session";
import { getOrCreateProfile } from "@/lib/profiles";
import { profileSchema } from "@/lib/validators/profile";

export type ActionResult =
  | { ok: true; message?: string }
  | { ok: false; error: string };

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

/**
 * Sets (or clears) the avatar or cover image key for the signed-in user.
 * The key must belong to the user (uploaded by them) — a caller cannot point
 * at another user's object.
 */
export async function setProfileImage(
  kind: "avatar" | "cover",
  key: string | null,
): Promise<ActionResult> {
  const user = await requireUser("/dashboard/profile");

  if (key !== null) {
    const prefix = kind === "avatar" ? `avatars/${user.id}/` : `covers/${user.id}/`;
    if (!key.startsWith(prefix) || key.length <= prefix.length) {
      return { ok: false, error: "Invalid image key." };
    }
  }

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
