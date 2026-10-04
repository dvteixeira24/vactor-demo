import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { getDb } from "@/db";
import { demoClips, profiles } from "@/db/schema";
import { getSession } from "@/lib/session";
import { clipSchema } from "@/lib/validators/clip";
import {
  audioExtFromMime,
  clipAudioKey,
  putObject,
  validateAudio,
} from "@/lib/storage";

function jsonField<T>(value: FormDataEntryValue | null, fallback: T): T {
  if (typeof value !== "string" || value === "") return fallback;
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) {
    return Response.json({ error: "You must be signed in." }, { status: 401 });
  }

  const form = await request.formData();
  const file = form.get("file");
  if (!(file instanceof File)) {
    return Response.json({ error: "No audio file provided." }, { status: 400 });
  }

  const fileCheck = validateAudio({ type: file.type, size: file.size });
  if (!fileCheck.ok) {
    return Response.json({ error: fileCheck.error }, { status: 400 });
  }

  const parsed = clipSchema.safeParse({
    title: form.get("title"),
    description: form.get("description"),
    category: form.get("category"),
    tags: jsonField<string[]>(form.get("tags"), []),
    durationSec: form.get("durationSec"),
    peaks: jsonField<number[]>(form.get("peaks"), []),
  });
  if (!parsed.success) {
    return Response.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid clip details." },
      { status: 400 },
    );
  }

  const db = await getDb();
  let profile = (
    await db
      .select()
      .from(profiles)
      .where(eq(profiles.userId, session.user.id))
      .limit(1)
  )[0];

  if (!profile) {
    const taken = new Set(
      (await db.select({ handle: profiles.handle }).from(profiles)).map(
        (r) => r.handle,
      ),
    );
    const { slugifyHandle, uniqueHandle } = await import("@/lib/handles");
    const id = crypto.randomUUID();
    await db.insert(profiles).values({
      id,
      userId: session.user.id,
      handle: uniqueHandle(slugifyHandle(session.user.name), taken),
      displayName: session.user.name,
    });
    profile = (
      await db.select().from(profiles).where(eq(profiles.id, id)).limit(1)
    )[0];
  }

  const clipId = crypto.randomUUID();
  const ext = audioExtFromMime(file.type)!;
  const key = clipAudioKey(session.user.id, clipId, ext);

  await putObject(key, await file.arrayBuffer(), file.type);

  const data = parsed.data;
  await db.insert(demoClips).values({
    id: clipId,
    profileId: profile.id,
    title: data.title,
    description: data.description || null,
    category: data.category,
    tags: data.tags,
    audioKey: key,
    mimeType: file.type,
    durationSec: data.durationSec,
    fileSize: file.size,
    peaks: data.peaks,
    status: "ready",
  });

  revalidatePath("/dashboard/clips");
  revalidatePath("/dashboard");
  revalidatePath("/");
  revalidatePath(`/actors/${profile.handle}`);

  return Response.json({ id: clipId }, { status: 201 });
}
