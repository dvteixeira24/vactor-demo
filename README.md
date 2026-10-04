# Vactor

A voice-acting marketplace demo: **actor profiles with playable demo clips** (a
SoundCloud-style waveform player) and a **job board with offers**. Built as a
portfolio piece — light, editorial, casting-directory aesthetic.

> Not a real marketplace: no payments, no messaging, jobs are seeded.

## Features

- Email/password auth (Better Auth) with profiles for voice actors.
- Real audio uploads with **client-side waveform extraction** — no server
  transcoding. Audio streams from R2 with HTTP range support for seeking.
- A persistent global waveform player that survives navigation.
- Actor directory with filters (category, language, voice character).
- A job board + offer submission (one offer per actor per job, updateable).
- Responsive, accessible (skip link, keyboard-operable player, ARIA), with
  loading skeletons, empty states, error boundary, and a real 404.

## Deliberately out of scope

Every control in the UI works end to end — there are no dead buttons or fake
metrics. These features are intentionally **absent** rather than stubbed:

- **Likes / favourites** — play counts are the only engagement metric; there is
  no like button and no likes data.
- **Social links** — a profile links to a single website; there are no
  Instagram/YouTube fields.
- **Offer status workflow** — an offer is always `Submitted`; there is no
  shortlist / accept / decline flow.
- **Payments, messaging, client accounts** — jobs are seeded and read-only on
  the client side; there is no in-app chat or checkout.

## Stack

| Concern | Choice |
|---|---|
| Framework | Next.js 16 (App Router) + React 19 + TypeScript |
| Styling | Tailwind CSS v4, token-driven (`src/app/globals.css`) |
| Hosting | Cloudflare Workers via `@opennextjs/cloudflare` |
| Database | Cloudflare D1 (SQLite) via Drizzle ORM |
| Storage | Cloudflare R2 (audio, avatars, covers) |
| Auth | Better Auth (Drizzle adapter over D1) |
| Validation | Zod |

## Local development

Prerequisites: Node 20+, pnpm.

```bash
pnpm install

# Apply the schema to the local D1 database
pnpm db:migrate

# Seed 10 actors, 30 playable clips, and 10 jobs
pnpm db:seed

pnpm dev
```

Open http://localhost:3000. Bindings (D1, R2) are provided to `next dev`
through the OpenNext dev bridge — no Docker or external services required.

### Scripts

| Script | Purpose |
|---|---|
| `pnpm dev` | Next.js dev server with D1/R2 bindings |
| `pnpm build` | Production build |
| `pnpm test` | Unit tests (Vitest) |
| `pnpm test:e2e` | End-to-end smoke tests (Playwright) |
| `pnpm db:generate` | Generate a Drizzle migration from the schema |
| `pnpm db:migrate` | Apply migrations to local D1 |
| `pnpm db:seed` | Regenerate + apply seed data (local) |
| `pnpm cf-typegen` | Regenerate `CloudflareEnv` binding types |
| `pnpm preview` | Build + preview the Worker locally (Wrangler) |
| `pnpm deploy` | Build + deploy to Cloudflare |

## Architecture

```
src/
  app/                 routes (App Router)
    api/clips          POST upload -> R2 + D1
    api/audio/[clipId] GET range-aware audio stream (200/206/416)
    api/media/[...key] GET images from R2
    jobs, actors, dashboard, (auth)
  actions/             server actions (profile, clips, offers)
  components/          player, clips, jobs, profile, ui, layout
  db/                  Drizzle schema, client (getDb), queries, seed data
  lib/                 audio pipeline, storage, validation, taxonomy
drizzle/               generated migrations (and seed artifacts)
```

### Audio pipeline

1. The browser decodes the file with the Web Audio API and downsamples it to
   1000 peak buckets (see `src/lib/audio/peaks.ts`).
2. The file streams to a Worker route (`/api/clips`) and into R2; peaks and
   metadata are stored in D1.
3. Playback goes through `/api/audio/[clipId]`, which honours `Range` headers
   so scrubbing works. `parseRange` is unit-tested, including 416 cases.

## Testing

- **Unit** (`pnpm test`): peaks, range parsing, duration/budget formatting,
  validators, handle generation, ownership guard.
- **E2E** (`pnpm test:e2e`): home + player, actor profile, job board.

## Deploying to Cloudflare

You need a Cloudflare account. Then:

```bash
# 1. Authenticate
npx wrangler login

# 2. Create the resources and copy the printed ids into wrangler.jsonc
npx wrangler d1 create vactor-db
npx wrangler r2 bucket create vactor-audio
npx wrangler kv namespace create KV
# -> set d1_databases[0].database_id and kv_namespaces[0].id in wrangler.jsonc

# 3. Set the auth secret (and update BETTER_AUTH_URL to your workers.dev URL)
openssl rand -base64 32 | npx wrangler secret put BETTER_AUTH_SECRET

# 4. Apply schema + seed to the remote database
pnpm db:migrate:remote
pnpm db:seed:remote

# 5. Deploy
pnpm deploy
```

Set `BETTER_AUTH_URL` in `wrangler.jsonc` `vars` to the deployed URL, then
redeploy so sessions are issued for the right origin.
