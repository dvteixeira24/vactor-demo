import { and, desc, eq, getTableColumns, inArray, like, or, sql } from "drizzle-orm";
import type { Db } from "./index";
import {
  clipLikes,
  demoClips,
  jobs,
  offers,
  profiles,
  user,
  type DemoClip,
  type Job,
  type Offer,
  type Profile,
} from "./schema";

export type ActorSummary = {
  id: string;
  handle: string;
  displayName: string;
  avatarKey: string | null;
  tagline: string | null;
};

export type ClipWithActor = { clip: DemoClip; actor: ActorSummary };

const actorColumns = {
  id: profiles.id,
  handle: profiles.handle,
  displayName: profiles.displayName,
  avatarKey: profiles.avatarKey,
  tagline: profiles.tagline,
};

export type ClipFilters = {
  limit?: number;
  category?: string;
  search?: string;
  actorHandle?: string;
};

/** Latest published clips, newest first, joined with a light actor summary. */
export async function listLatestClips(
  db: Db,
  { limit = 24, category, search, actorHandle }: ClipFilters = {},
): Promise<ClipWithActor[]> {
  const conditions = [eq(profiles.isPublished, true)];
  if (category) conditions.push(eq(demoClips.category, category));
  if (actorHandle) conditions.push(eq(profiles.handle, actorHandle));
  if (search) {
    const q = `%${search}%`;
    conditions.push(
      or(
        like(demoClips.title, q),
        like(profiles.displayName, q),
        like(profiles.handle, q),
      )!,
    );
  }

  const rows = await db
    .select({ clip: demoClips, actor: actorColumns })
    .from(demoClips)
    .innerJoin(profiles, eq(demoClips.profileId, profiles.id))
    .where(and(...conditions))
    .orderBy(desc(demoClips.createdAt))
    .limit(limit);
  return rows;
}

/** Most-played published clips. */
export async function listFeaturedClips(
  db: Db,
  limit = 6,
): Promise<ClipWithActor[]> {
  return db
    .select({ clip: demoClips, actor: actorColumns })
    .from(demoClips)
    .innerJoin(profiles, eq(demoClips.profileId, profiles.id))
    .where(eq(profiles.isPublished, true))
    .orderBy(desc(demoClips.playCount), desc(demoClips.createdAt))
    .limit(limit);
}

export async function getClipWithActor(
  db: Db,
  clipId: string,
): Promise<ClipWithActor | null> {
  const rows = await db
    .select({ clip: demoClips, actor: actorColumns })
    .from(demoClips)
    .innerJoin(profiles, eq(demoClips.profileId, profiles.id))
    .where(eq(demoClips.id, clipId))
    .limit(1);
  return rows[0] ?? null;
}

/** All clips for a profile, for the public profile page. */
export async function listClipsForProfile(
  db: Db,
  profileId: string,
): Promise<DemoClip[]> {
  return db
    .select()
    .from(demoClips)
    .where(eq(demoClips.profileId, profileId))
    .orderBy(desc(demoClips.createdAt));
}

export type ActorListItem = Profile & { clipCount: number };

export type ActorFilters = {
  search?: string;
  category?: string;
  language?: string;
  accent?: string;
  tag?: string;
  limit?: number;
};

/** Published actor directory, filtered server-side. */
export async function listActors(
  db: Db,
  { search, category, language, accent, tag, limit = 60 }: ActorFilters = {},
): Promise<ActorListItem[]> {
  const conditions = [eq(profiles.isPublished, true)];

  if (category) {
    const withCategory = db
      .selectDistinct({ id: demoClips.profileId })
      .from(demoClips)
      .where(eq(demoClips.category, category));
    conditions.push(inArray(profiles.id, withCategory));
  }
  if (accent) conditions.push(like(profiles.accent, `%${accent}%`));
  if (search) {
    const q = `%${search}%`;
    conditions.push(
      or(
        like(profiles.displayName, q),
        like(profiles.handle, q),
        like(profiles.tagline, q),
        like(profiles.location, q),
      )!,
    );
  }
  if (language) conditions.push(like(profiles.languages, `%${language}%`));
  if (tag) conditions.push(like(profiles.voiceTags, `%${tag}%`));

  const clipCount = sql<number>`(
    select count(*) from ${demoClips} where ${demoClips.profileId} = ${profiles.id}
  )`;

  const rows = await db
    .select({ ...getTableColumns(profiles), clipCount })
    .from(profiles)
    .where(and(...conditions))
    .orderBy(desc(profiles.createdAt))
    .limit(limit);

  return rows.map((r) => ({ ...r, clipCount: Number(r.clipCount) }));
}

export async function getActorByHandle(
  db: Db,
  handle: string,
): Promise<Profile | null> {
  const rows = await db
    .select()
    .from(profiles)
    .where(eq(profiles.handle, handle))
    .limit(1);
  return rows[0] ?? null;
}

export async function getProfileByUserId(
  db: Db,
  userId: string,
): Promise<Profile | null> {
  const rows = await db
    .select()
    .from(profiles)
    .where(eq(profiles.userId, userId))
    .limit(1);
  return rows[0] ?? null;
}

export async function getJobById(db: Db, id: string): Promise<Job | null> {
  const rows = await db.select().from(jobs).where(eq(jobs.id, id)).limit(1);
  return rows[0] ?? null;
}

export type JobFilters = {
  search?: string;
  category?: string;
  locationType?: string;
  limit?: number;
};

export async function listJobs(
  db: Db,
  { search, category, locationType, limit = 40 }: JobFilters = {},
): Promise<Job[]> {
  const conditions = [eq(jobs.isActive, true)];
  if (category) conditions.push(eq(jobs.category, category));
  if (locationType === "remote" || locationType === "onsite") {
    conditions.push(eq(jobs.locationType, locationType));
  }
  if (search) {
    const q = `%${search}%`;
    conditions.push(
      or(like(jobs.title, q), like(jobs.clientName, q), like(jobs.description, q))!,
    );
  }
  return db
    .select()
    .from(jobs)
    .where(and(...conditions))
    .orderBy(desc(jobs.postedAt))
    .limit(limit);
}

export async function getOffer(
  db: Db,
  jobId: string,
  userId: string,
): Promise<Offer | null> {
  const rows = await db
    .select()
    .from(offers)
    .where(and(eq(offers.jobId, jobId), eq(offers.userId, userId)))
    .limit(1);
  return rows[0] ?? null;
}

export type OfferWithJob = { offer: Offer; job: Job | null };

export async function listOffersByUser(
  db: Db,
  userId: string,
): Promise<OfferWithJob[]> {
  return db
    .select({ offer: offers, job: jobs })
    .from(offers)
    .leftJoin(jobs, eq(offers.jobId, jobs.id))
    .where(eq(offers.userId, userId))
    .orderBy(desc(offers.createdAt));
}

export type OfferWithActor = {
  offer: Offer;
  actor: ActorSummary | null;
  user: { name: string; email: string } | null;
};

/** Offers submitted to a job (used on the job detail page). */
export async function listOffersForJob(db: Db, jobId: string): Promise<Offer[]> {
  return db
    .select()
    .from(offers)
    .where(eq(offers.jobId, jobId))
    .orderBy(desc(offers.createdAt));
}

export type DashboardStats = {
  clipCount: number;
  totalPlays: number;
  offerCount: number;
  likeCount: number;
};

export async function getDashboardStats(
  db: Db,
  userId: string,
  profileId: string | null,
): Promise<DashboardStats> {
  const [clipRow] = profileId
    ? await db
        .select({
          clipCount: sql<number>`count(*)`,
          totalPlays: sql<number>`coalesce(sum(${demoClips.playCount}), 0)`,
        })
        .from(demoClips)
        .where(eq(demoClips.profileId, profileId))
    : [{ clipCount: 0, totalPlays: 0 }];

  const [offerRow] = await db
    .select({ offerCount: sql<number>`count(*)` })
    .from(offers)
    .where(eq(offers.userId, userId));

  const [likeRow] = profileId
    ? await db
        .select({ likeCount: sql<number>`count(*)` })
        .from(clipLikes)
        .innerJoin(demoClips, eq(clipLikes.clipId, demoClips.id))
        .where(eq(demoClips.profileId, profileId))
    : [{ likeCount: 0 }];

  return {
    clipCount: Number(clipRow?.clipCount ?? 0),
    totalPlays: Number(clipRow?.totalPlays ?? 0),
    offerCount: Number(offerRow?.offerCount ?? 0),
    likeCount: Number(likeRow?.likeCount ?? 0),
  };
}

// Re-exported so callers can build selects consistently.
export { user };
