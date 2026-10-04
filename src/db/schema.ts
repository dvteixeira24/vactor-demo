import { relations, sql } from "drizzle-orm";
import {
  index,
  integer,
  real,
  sqliteTable,
  text,
  uniqueIndex,
} from "drizzle-orm/sqlite-core";

/* -------------------------------------------------------------------------- */
/* Better Auth core tables (singular names — match drizzleAdapter defaults)   */
/* -------------------------------------------------------------------------- */

const epochMs = sql`(cast(unixepoch('subsecond') * 1000 as integer))`;

export const user = sqliteTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: integer("email_verified", { mode: "boolean" })
    .default(false)
    .notNull(),
  image: text("image"),
  createdAt: integer("created_at", { mode: "timestamp_ms" })
    .default(epochMs)
    .notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp_ms" })
    .default(epochMs)
    .$onUpdate(() => new Date())
    .notNull(),
});

export const session = sqliteTable(
  "session",
  {
    id: text("id").primaryKey(),
    expiresAt: integer("expires_at", { mode: "timestamp_ms" }).notNull(),
    token: text("token").notNull().unique(),
    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .default(epochMs)
      .notNull(),
    updatedAt: integer("updated_at", { mode: "timestamp_ms" })
      .default(epochMs)
      .$onUpdate(() => new Date())
      .notNull(),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
  },
  (t) => [index("session_user_id_idx").on(t.userId)],
);

export const account = sqliteTable(
  "account",
  {
    id: text("id").primaryKey(),
    accountId: text("account_id").notNull(),
    providerId: text("provider_id").notNull(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    accessToken: text("access_token"),
    refreshToken: text("refresh_token"),
    idToken: text("id_token"),
    accessTokenExpiresAt: integer("access_token_expires_at", {
      mode: "timestamp_ms",
    }),
    refreshTokenExpiresAt: integer("refresh_token_expires_at", {
      mode: "timestamp_ms",
    }),
    scope: text("scope"),
    password: text("password"),
    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .default(epochMs)
      .notNull(),
    updatedAt: integer("updated_at", { mode: "timestamp_ms" })
      .default(epochMs)
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (t) => [index("account_user_id_idx").on(t.userId)],
);

export const verification = sqliteTable(
  "verification",
  {
    id: text("id").primaryKey(),
    identifier: text("identifier").notNull(),
    value: text("value").notNull(),
    expiresAt: integer("expires_at", { mode: "timestamp_ms" }).notNull(),
    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .default(epochMs)
      .notNull(),
    updatedAt: integer("updated_at", { mode: "timestamp_ms" })
      .default(epochMs)
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (t) => [index("verification_identifier_idx").on(t.identifier)],
);

/* -------------------------------------------------------------------------- */
/* Vactor tables                                                              */
/* -------------------------------------------------------------------------- */

export const profiles = sqliteTable(
  "profiles",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    handle: text("handle").notNull().unique(),
    displayName: text("display_name").notNull(),
    tagline: text("tagline"),
    bio: text("bio"),
    location: text("location"),
    avatarKey: text("avatar_key"),
    coverKey: text("cover_key"),
    languages: text("languages", { mode: "json" })
      .$type<string[]>()
      .notNull()
      .default(sql`'[]'`),
    accent: text("accent"),
    voiceTags: text("voice_tags", { mode: "json" })
      .$type<string[]>()
      .notNull()
      .default(sql`'[]'`),
    websiteUrl: text("website_url"),
    yearsExperience: integer("years_experience"),
    isPublished: integer("is_published", { mode: "boolean" })
      .notNull()
      .default(false),
    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .default(epochMs)
      .notNull(),
    updatedAt: integer("updated_at", { mode: "timestamp_ms" })
      .default(epochMs)
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (t) => [
    uniqueIndex("profiles_user_id_unique").on(t.userId),
    index("profiles_handle_idx").on(t.handle),
  ],
);

export const demoClips = sqliteTable(
  "demo_clips",
  {
    id: text("id").primaryKey(),
    profileId: text("profile_id")
      .notNull()
      .references(() => profiles.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    description: text("description"),
    category: text("category").notNull(),
    tags: text("tags", { mode: "json" })
      .$type<string[]>()
      .notNull()
      .default(sql`'[]'`),
    audioKey: text("audio_key").notNull(),
    mimeType: text("mime_type").notNull(),
    durationSec: real("duration_sec").notNull().default(0),
    fileSize: integer("file_size").notNull().default(0),
    peaks: text("peaks", { mode: "json" })
      .$type<number[]>()
      .notNull()
      .default(sql`'[]'`),
    playCount: integer("play_count").notNull().default(0),
    status: text("status", { enum: ["processing", "ready", "failed"] })
      .notNull()
      .default("ready"),
    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .default(epochMs)
      .notNull(),
    updatedAt: integer("updated_at", { mode: "timestamp_ms" })
      .default(epochMs)
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (t) => [
    index("demo_clips_profile_id_idx").on(t.profileId),
    index("demo_clips_created_at_idx").on(t.createdAt),
    index("demo_clips_category_idx").on(t.category),
  ],
);

export const jobs = sqliteTable(
  "jobs",
  {
    id: text("id").primaryKey(),
    title: text("title").notNull(),
    clientName: text("client_name").notNull(),
    description: text("description").notNull(),
    category: text("category").notNull(),
    budgetMin: integer("budget_min"),
    budgetMax: integer("budget_max"),
    rateType: text("rate_type", { enum: ["fixed", "hourly", "per_word"] })
      .notNull()
      .default("fixed"),
    currency: text("currency").notNull().default("USD"),
    locationType: text("location_type", { enum: ["remote", "onsite"] })
      .notNull()
      .default("remote"),
    deadline: text("deadline"),
    tags: text("tags", { mode: "json" })
      .$type<string[]>()
      .notNull()
      .default(sql`'[]'`),
    isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
    postedAt: integer("posted_at", { mode: "timestamp_ms" })
      .default(epochMs)
      .notNull(),
  },
  (t) => [
    index("jobs_category_idx").on(t.category),
    index("jobs_posted_at_idx").on(t.postedAt),
  ],
);

export const offers = sqliteTable(
  "offers",
  {
    id: text("id").primaryKey(),
    jobId: text("job_id")
      .notNull()
      .references(() => jobs.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    rateAmount: integer("rate_amount").notNull(),
    rateType: text("rate_type", { enum: ["fixed", "hourly", "per_word"] })
      .notNull()
      .default("fixed"),
    currency: text("currency").notNull().default("USD"),
    message: text("message"),
    status: text("status", {
      enum: ["submitted"],
    })
      .notNull()
      .default("submitted"),
    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .default(epochMs)
      .notNull(),
    updatedAt: integer("updated_at", { mode: "timestamp_ms" })
      .default(epochMs)
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (t) => [
    uniqueIndex("offers_job_user_unique").on(t.jobId, t.userId),
    index("offers_user_id_idx").on(t.userId),
  ],
);

/* -------------------------------------------------------------------------- */
/* Relations                                                                  */
/* -------------------------------------------------------------------------- */

export const userRelations = relations(user, ({ many, one }) => ({
  sessions: many(session),
  accounts: many(account),
  profile: one(profiles),
  offers: many(offers),
}));

export const sessionRelations = relations(session, ({ one }) => ({
  user: one(user, { fields: [session.userId], references: [user.id] }),
}));

export const accountRelations = relations(account, ({ one }) => ({
  user: one(user, { fields: [account.userId], references: [user.id] }),
}));

export const profileRelations = relations(profiles, ({ one, many }) => ({
  user: one(user, { fields: [profiles.userId], references: [user.id] }),
  clips: many(demoClips),
}));

export const demoClipRelations = relations(demoClips, ({ one }) => ({
  profile: one(profiles, {
    fields: [demoClips.profileId],
    references: [profiles.id],
  }),
}));

export const jobRelations = relations(jobs, ({ many }) => ({
  offers: many(offers),
}));

export const offerRelations = relations(offers, ({ one }) => ({
  job: one(jobs, { fields: [offers.jobId], references: [jobs.id] }),
  user: one(user, { fields: [offers.userId], references: [user.id] }),
}));

/* -------------------------------------------------------------------------- */
/* Inferred types                                                             */
/* -------------------------------------------------------------------------- */

export type User = typeof user.$inferSelect;
export type Profile = typeof profiles.$inferSelect;
export type NewProfile = typeof profiles.$inferInsert;
export type DemoClip = typeof demoClips.$inferSelect;
export type NewDemoClip = typeof demoClips.$inferInsert;
export type Job = typeof jobs.$inferSelect;
export type NewJob = typeof jobs.$inferInsert;
export type Offer = typeof offers.$inferSelect;
export type NewOffer = typeof offers.$inferInsert;
