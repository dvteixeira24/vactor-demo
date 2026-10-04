/**
 * Generates `drizzle/seed.sql`, WAV tones in `drizzle/seed-audio/`, and the
 * `wrangler r2 object put` helper scripts so seeded clips are playable.
 *
 * Run via `pnpm db:seed` (local) or `pnpm db:seed:remote`.
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { downsamplePeaks } from "../src/lib/audio/peaks";
import { slugifyHandle } from "../src/lib/handles";
import { actors, clipIdeas, jobs } from "../src/db/seed-data";

const SAMPLE_RATE = 8000;
const PEAK_BUCKETS = 300;
const OUT_DIR = "drizzle";
const AUDIO_DIR = join(OUT_DIR, "seed-audio");

// Frequencies for the small pool of generated tones.
const TONE_FREQS = [196, 233, 262, 311, 349, 392, 440, 523];

function esc(value: string): string {
  return value.replace(/'/g, "''");
}

function makeTone(freq: number, seconds: number) {
  const samples = new Float32Array(SAMPLE_RATE * seconds);
  for (let i = 0; i < samples.length; i += 1) {
    const t = i / SAMPLE_RATE;
    const fade = Math.min(1, t / 0.15, (seconds - t) / 0.2);
    const tremolo = 0.55 + 0.45 * Math.sin(2 * Math.PI * 2.5 * t);
    samples[i] = Math.sin(2 * Math.PI * freq * t) * 0.6 * tremolo * Math.max(0, fade);
  }
  return samples;
}

function toWav(samples: Float32Array): Buffer {
  const n = samples.length;
  const buffer = Buffer.alloc(44 + n * 2);
  buffer.write("RIFF", 0);
  buffer.writeUInt32LE(36 + n * 2, 4);
  buffer.write("WAVE", 8);
  buffer.write("fmt ", 12);
  buffer.writeUInt32LE(16, 16);
  buffer.writeUInt16LE(1, 20);
  buffer.writeUInt16LE(1, 22);
  buffer.writeUInt32LE(SAMPLE_RATE, 24);
  buffer.writeUInt32LE(SAMPLE_RATE * 2, 28);
  buffer.writeUInt16LE(2, 32);
  buffer.writeUInt16LE(16, 34);
  buffer.write("data", 36);
  buffer.writeUInt32LE(n * 2, 40);
  for (let i = 0; i < n; i += 1) {
    const v = Math.max(-1, Math.min(1, samples[i]));
    buffer.writeInt16LE(Math.round(v * 32767), 44 + i * 2);
  }
  return buffer;
}

mkdirSync(AUDIO_DIR, { recursive: true });

// 1. Generate tones + peaks.
const tones = TONE_FREQS.map((freq, index) => {
  const seconds = 6 + index * 1.5;
  const samples = makeTone(freq, seconds);
  const wav = toWav(samples);
  const file = `tone-${index + 1}.wav`;
  writeFileSync(join(AUDIO_DIR, file), wav);
  return {
    key: `clips/seed/${file}`,
    file,
    durationSec: Number(seconds.toFixed(2)),
    fileSize: wav.length,
    peaks: downsamplePeaks(samples, PEAK_BUCKETS),
  };
});

// 2. Build SQL.
const statements: string[] = [];
const now = Date.now();

statements.push("DELETE FROM clip_likes;");
statements.push("DELETE FROM offers;");
statements.push("DELETE FROM demo_clips;");
statements.push("DELETE FROM jobs;");
statements.push("DELETE FROM profiles;");
statements.push(
  "DELETE FROM user WHERE email LIKE '%@seed.vactor.local';",
);

actors.forEach((actor, i) => {
  const userId = `seed-user-${i + 1}`;
  const profileId = `seed-profile-${i + 1}`;
  const createdAt = now - (actors.length - i) * 86_400_000;
  const email = `${slugifyHandle(actor.name)}@seed.vactor.local`;

  statements.push(
    `INSERT OR REPLACE INTO user (id,name,email,email_verified,image,created_at,updated_at) VALUES ('${userId}','${esc(actor.name)}','${email}',1,NULL,${createdAt},${createdAt});`,
  );

  statements.push(
    `INSERT OR REPLACE INTO profiles (id,user_id,handle,display_name,tagline,bio,location,avatar_key,cover_key,languages,accent,voice_tags,website_url,socials,years_experience,is_published,created_at,updated_at) VALUES (` +
      `'${profileId}','${userId}','${slugifyHandle(actor.name)}','${esc(actor.name)}',` +
      `'${esc(actor.tagline)}','${esc(actor.bio)}','${esc(actor.location)}',NULL,NULL,` +
      `'${esc(JSON.stringify(actor.languages))}','${esc(actor.accent)}','${esc(JSON.stringify(actor.voiceTags))}',` +
      `NULL,'{}',${actor.years},1,${createdAt},${createdAt});`,
  );
});

jobs.forEach((job, i) => {
  const createdAt = now - (jobs.length - i) * 43_200_000;
  statements.push(
    `INSERT OR REPLACE INTO jobs (id,title,client_name,description,category,budget_min,budget_max,rate_type,currency,location_type,deadline,tags,is_active,posted_at) VALUES (` +
      `'seed-job-${i + 1}','${esc(job.title)}','${esc(job.clientName)}','${esc(job.description)}','${job.category}',` +
      `${job.budgetMin},${job.budgetMax},'${job.rateType}','${job.currency}','${job.locationType}','${job.deadline}',` +
      `'${esc(JSON.stringify(job.tags))}',1,${createdAt});`,
  );
});

actors.forEach((actor, actorIndex) => {
  const profileId = `seed-profile-${actorIndex + 1}`;
  for (let k = 0; k < 3; k += 1) {
    const idea = clipIdeas[(actorIndex * 3 + k) % clipIdeas.length];
    const tone = tones[(actorIndex + k) % tones.length];
    const clipId = `seed-clip-${actorIndex + 1}-${k + 1}`;
    const createdAt = now - (actorIndex * 3 + k + 1) * 5_400_000;
    const playCount = 40 + ((actorIndex * 37 + k * 91) % 4000);
    statements.push(
      `INSERT OR REPLACE INTO demo_clips (id,profile_id,title,description,category,tags,audio_key,mime_type,duration_sec,file_size,peaks,play_count,status,created_at,updated_at) VALUES (` +
        `'${clipId}','${profileId}','${esc(idea.title)}','${esc(`${actor.name} — ${idea.category.toLowerCase()} demo.`)}','${idea.category}',` +
        `'${esc(JSON.stringify(idea.tags))}','${tone.key}','audio/wav',${tone.durationSec},${tone.fileSize},` +
        `'${esc(JSON.stringify(tone.peaks))}',${playCount},'ready',${createdAt},${createdAt});`,
    );
  }
});

writeFileSync(join(OUT_DIR, "seed.sql"), statements.join("\n") + "\n");

// 3. Emit R2 upload helper scripts.
const puts = (flag: string) =>
  tones
    .map(
      (tone) =>
        `wrangler r2 object put "vactor-audio/${tone.key}" --file="${join(AUDIO_DIR, tone.file)}" ${flag}`,
    )
    .join("\n");
writeFileSync(
  join(OUT_DIR, "seed-r2.sh"),
  `#!/usr/bin/env bash\nset -e\n${puts("--local")}\n`,
);
writeFileSync(
  join(OUT_DIR, "seed-r2-remote.sh"),
  `#!/usr/bin/env bash\nset -e\n${puts("--remote")}\n`,
);

console.log(
  `Seed written: ${actors.length} actors, ${actors.length * 3} clips, ${jobs.length} jobs, ${tones.length} tones.`,
);
