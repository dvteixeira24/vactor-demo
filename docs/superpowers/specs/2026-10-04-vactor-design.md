# Vactor — Design Spec

**Date:** 2026-10-04
**Status:** Approved (decisions delegated to implementer)
**Purpose:** A portfolio/demo web app: a modern voice-acting marketplace with two pillars — (1) voice-actor profiles + demo clips, and (2) a job board with voice-acting offers.

## 1. Goals & non-goals

### Goals
- Light, professional "casting directory" aesthetic; fully responsive (mobile + desktop).
- Voice actors sign up, build a profile, and upload real audio demo clips.
- A SoundCloud-like global audio player with waveform visualization and scrub/seek.
- A job board of seeded listings; logged-in actors browse and submit offers.
- Deployed to Cloudflare Workers (free tier), with D1 + R2.

### Non-goals (explicitly cut)
- Real payments / escrow / contracts.
- In-app messaging or chat threads.
- Client/employer accounts — jobs are seeded only.
- Server-side audio transcoding (no ffmpeg); we accept common web formats as-is.
- Notifications, email delivery, moderation tooling.

## 2. Personas
- **Voice actor (primary user):** signs up, creates a profile, uploads clips, browses jobs, submits offers.
- **Visitor (unauthenticated):** browses the feed, actor directory, profiles and jobs; prompted to sign in to apply.

## 3. Architecture

| Concern | Choice |
|---|---|
| Framework | Next.js 16 (App Router) + React 19 + TypeScript |
| Styling | Tailwind CSS v4 + a token-driven design system |
| Hosting | Cloudflare Workers via `@opennextjs/cloudflare` (OpenNext adapter) |
| Database | Cloudflare D1 (SQLite) via Drizzle ORM (`drizzle-orm/d1`) |
| Object storage | Cloudflare R2 (audio, avatars, covers) via Worker bindings |
| Session/rate-limit | Cloudflare KV (Better Auth) |
| Auth | Better Auth (`better-auth-cloudflare`), email + password |
| Validation | Zod at every mutation boundary |
| Testing | Vitest (unit + D1 integration), Playwright (E2E smoke) |

**Runtime rules (Cloudflare):** no local filesystem; `nodejs_compat` enabled; all bindings accessed through `getCloudflareContext()`. Server Components read D1 directly; client components only where interactivity is needed.

## 4. Data model

Better Auth manages `user`, `session`, `account`, `verification`. Everything else is ours.

```
user ──1:1── profile ──1:N── demo_clip ──1:N── clip_like
  │
  └──1:N── offer ──N:1── job
```

| Table | Fields |
|---|---|
| `profile` | `id`, `userId` (unique FK), `handle` (unique), `displayName`, `tagline`, `bio`, `location`, `avatarKey`, `coverKey`, `languages` (json), `accent`, `voiceTags` (json), `websiteUrl`, `socials` (json), `yearsExperience`, `isPublished`, timestamps |
| `demo_clip` | `id`, `profileId` FK, `title`, `description`, `category`, `tags` (json), `audioKey`, `mimeType`, `durationSec`, `fileSize`, `peaks` (json number[]), `playCount`, `status` (`processing`/`ready`/`failed`), timestamps |
| `job` | `id`, `title`, `clientName`, `description`, `category`, `budgetMin`, `budgetMax`, `rateType` (`fixed`/`hourly`/`per_word`), `currency`, `locationType` (`remote`/`onsite`), `deadline`, `tags` (json), `isActive`, `postedAt` |
| `offer` | `id`, `jobId` FK, `userId` FK, `rateAmount`, `rateType`, `currency`, `message`, `status` (`submitted`/`shortlisted`/`declined`/`accepted`), timestamps. Unique `(jobId, userId)` |
| `clip_like` | `id`, `userId` FK, `clipId` FK, unique `(userId, clipId)` |

**Taxonomy (single source, `src/lib/taxonomy.ts`):**
- Categories: Commercial, Narration, Animation, Video Games, Audiobooks, E-Learning, Promo/Trailer, Character, Corporate, IVR.
- Voice tags: Warm, Authoritative, Youthful, Gritty, Conversational, Energetic, Calm, Character-y, Corporate, Deep.
- Languages: seeded common set; accents free-text with suggestions.

## 5. Routes & flows

### Public
- `/` — hero + search, category chips, latest-demos feed, featured-jobs strip.
- `/actors` — talent directory, filters (category, language, accent, tags).
- `/actors/[handle]` — public profile with inline-waveform demo clips.
- `/jobs` — job board with filters (category, rate, remote/onsite).
- `/jobs/[id]` — job detail + offer form (or sign-in CTA); shows your offer if present.
- `/login`, `/signup`.

### Authenticated
- `/dashboard` — profile completeness, clip count, total plays, offers sent.
- `/dashboard/profile` — create/edit profile + avatar/cover upload.
- `/dashboard/clips` — manage clips (edit, feature, delete).
- `/dashboard/clips/new` — upload flow.
- `/dashboard/offers` — offers sent + status.

### Global player
`PlayerProvider` context + one `<audio>` element in the root layout; persistent bottom bar with waveform, click-to-seek, play/pause, prev/next. Collapses to a compact bar on mobile with a full-screen expanded view.

### Primary flows
1. Sign up → create profile → upload first clip → published to `/actors` + feed.
2. Home → tap clip → global player plays in place → tap actor → profile.
3. Jobs → job detail → submit offer → job shows "Your offer: $X — Submitted".
4. Dashboard → offers list with statuses.

## 6. Audio pipeline

1. **Validate** client-side: allowed types `audio/mpeg`, `audio/wav`, `audio/mp4`, `audio/ogg`, `audio/webm`; max 25 MB.
2. **Process** client-side with Web Audio API: `decodeAudioData` → compute duration and downsample to **1000 peak buckets** (0–1 floats).
3. **Upload:** `POST /api/clips` (multipart) → Zod-validate → stream file into R2 binding (`clips/{userId}/{clipId}.{ext}`) → insert `demo_clip` row (`status: ready`) with peaks + metadata.
4. **Playback:** `GET /api/audio/[clipId]` → R2 `get(key, { range })` → `206 Partial Content` with `Content-Range` + `Accept-Ranges`; enables seeking.
5. **Play count:** `POST /api/clips/[id]/play` (fire-and-forget on play start).
6. **Likes:** server action toggle on `clip_like`.

Failure handling: unsupported format and oversize rejected before upload; upload failure preserves the selected file for retry; decode failure surfaces a clear message; invalid clip IDs 404.

## 7. Auth & access control

- Better Auth email/password, Drizzle adapter over D1, KV for secondary storage.
- Helpers: `getSession()` (RSC), `requireUser()` (throws/redirects) for protected pages and actions.
- Ownership checks on all profile/clip mutations.
- Unauthenticated mutations redirect to `/login?callbackUrl=…`.

## 8. Error handling, loading & empty states

- Zod validation on every input; typed error results surfaced as inline field errors or toasts.
- Next.js `loading.tsx` skeletons for feed, profile, jobs; `error.tsx` boundaries; `not-found.tsx`.
- Empty states: no clips, no offers, no search results, no likes.
- Toasts via a small `useToast` provider (no heavy dependency).

## 9. Visual system (foundation for the `impeccable` skill)

- **Direction:** light, editorial, casting-directory. Generous whitespace, strong typography, restrained color; audio + waveform as the one vivid accent.
- **Tokens** in Tailwind v4 `@theme`: ink near-black; warm off-white background; muted grays; one accent (deep indigo) plus a warm secondary for status; success/warn/danger.
- **Type:** modern grotesk for UI (e.g. Geist) + a refined serif for display headings to add editorial character; tabular numerals for rates/durations.
- **Components:** cards with hairline borders + soft shadow, pill filters, avatars, featured badge, waveform player, sticky header, sticky player bar.
- **Motion:** subtle transitions only; honor `prefers-reduced-motion`.
- **Accessibility:** WCAG AA contrast, semantic landmarks, keyboard-operable player and filters, visible focus rings, ARIA labels on icon buttons.
- **Responsive:** mobile-first; single column → multi-column grids; bottom player collapses.

## 10. Testing strategy

- **Unit (Vitest):** peak-downsampling math, duration/rate formatting, Zod schemas, offer permission logic.
- **Integration (Vitest + in-memory SQLite via Drizzle):** repository queries (feed ordering, filters, offer uniqueness).
- **E2E (Playwright):** signup → create profile → upload clip → play → submit offer.
- Manual: Lighthouse + responsive checks on home, profile, job.

## 11. Seed data

Script seeds ~10 voice actors (profiles + avatars), ~30 demo clips across categories (peaks generated with a small script so seeds render real waveforms without shipping audio fixtures — seeded clips use royalty-free/generated tones), and ~10 jobs. Seed is idempotent.

## 12. Deployment

- `wrangler.jsonc`: `main = .open-next/worker.js`, `assets`, `nodejs_compat`, bindings `DB` (D1), `AUDIO` (R2), `KV`.
- Migrations via `drizzle-kit generate` + `wrangler d1 migrations apply`.
- Scripts: `dev`, `build`, `preview`, `deploy`, `cf-typegen`, `db:generate`, `db:migrate`, `seed`.
- Secrets (Better Auth secret, etc.) via `wrangler secret put`.

## 13. Build order (implementation phases)

1. Scaffold Next.js + Tailwind + OpenNext + Wrangler; design tokens; base layout.
2. Drizzle schema + D1 binding + migrations + `getDb()`.
3. Better Auth on D1/KV + auth pages + session helpers.
4. Profiles: CRUD, avatar/cover upload, public profile page.
5. Clips: upload route handler, R2, peaks, audio streaming route, waveform player + global player.
6. Feed, actor directory, filters.
7. Jobs + offers: board, detail, offer form, dashboard offers.
8. Dashboard + polish, empty/loading/error states, a11y pass.
9. Seed data.
10. Tests, then deploy to Cloudflare.
