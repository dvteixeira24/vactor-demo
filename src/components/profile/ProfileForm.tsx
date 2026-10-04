"use client";

import { useState, useTransition } from "react";
import { Check, Loader2 } from "lucide-react";
import { updateProfile } from "@/app/actions/profile";
import { ChipToggle } from "@/components/ui/ChipToggle";
import { TextArea, TextField } from "@/components/ui/Field";
import { LANGUAGES, VOICE_TAGS } from "@/lib/taxonomy";
import type { Profile } from "@/db/schema";

export function ProfileForm({ profile }: { profile: Profile | null }) {
  const [displayName, setDisplayName] = useState(profile?.displayName ?? "");
  const [tagline, setTagline] = useState(profile?.tagline ?? "");
  const [bio, setBio] = useState(profile?.bio ?? "");
  const [location, setLocation] = useState(profile?.location ?? "");
  const [accent, setAccent] = useState(profile?.accent ?? "");
  const [websiteUrl, setWebsiteUrl] = useState(profile?.websiteUrl ?? "");
  const [years, setYears] = useState(
    profile?.yearsExperience?.toString() ?? "",
  );
  const [languages, setLanguages] = useState<string[]>(
    profile?.languages ?? [],
  );
  const [voiceTags, setVoiceTags] = useState<string[]>(profile?.voiceTags ?? []);
  const [isPublished, setIsPublished] = useState(profile?.isPublished ?? false);
  const [status, setStatus] = useState<{ ok: boolean; msg: string } | null>(
    null,
  );
  const [pending, startTransition] = useTransition();

  function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setStatus(null);
    startTransition(async () => {
      const result = await updateProfile({
        displayName,
        tagline,
        bio,
        location,
        accent,
        websiteUrl,
        yearsExperience: years === "" ? undefined : years,
        languages,
        voiceTags,
        isPublished,
      });
      setStatus(
        result.ok
          ? { ok: true, msg: result.message ?? "Profile saved." }
          : { ok: false, msg: result.error },
      );
    });
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-8">
      <Section title="Basics" description="How casting directors see you.">
        <TextField
          label="Display name"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          placeholder="Jordan Rivera"
          required
          minLength={2}
          maxLength={60}
        />
        <TextField
          label="Tagline"
          value={tagline}
          onChange={(e) => setTagline(e.target.value)}
          placeholder="Warm, grounded, and character-ready"
          maxLength={120}
        />
        <TextArea
          label="Bio"
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          rows={5}
          maxLength={2000}
          placeholder="Tell your story — training, studio setup, favourite kinds of work."
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField
            label="Location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="London, UK"
            maxLength={80}
          />
          <TextField
            label="Years of experience"
            value={years}
            onChange={(e) => setYears(e.target.value)}
            type="number"
            min={0}
            max={80}
            placeholder="5"
          />
        </div>
      </Section>

      <Section title="Voice" description="What your voice sounds like and does.">
        <TextField
          label="Accent"
          value={accent}
          onChange={(e) => setAccent(e.target.value)}
          placeholder="Neutral British"
          maxLength={60}
        />
        <ChipToggle
          label="Languages"
          options={LANGUAGES}
          selected={languages}
          onChange={setLanguages}
          max={10}
        />
        <ChipToggle
          label="Voice character"
          options={VOICE_TAGS}
          selected={voiceTags}
          onChange={setVoiceTags}
          max={10}
        />
      </Section>

      <Section title="Links" description="Where people can find or book you.">
        <TextField
          label="Website"
          type="url"
          value={websiteUrl}
          onChange={(e) => setWebsiteUrl(e.target.value)}
          placeholder="https://yourname.com"
        />
      </Section>

      <div className="flex flex-col gap-4 border-t border-line pt-6 sm:flex-row sm:items-center sm:justify-between">
        <label className="flex items-center gap-3 text-sm">
          <input
            type="checkbox"
            checked={isPublished}
            onChange={(e) => setIsPublished(e.target.checked)}
            className="size-4 accent-[var(--color-accent)]"
          />
          <span>
            <span className="font-medium text-ink">Publish my profile</span>
            <span className="block text-xs text-muted">
              Discoverable in the actor directory and clips feed.
            </span>
          </span>
        </label>

        <div className="flex items-center gap-3">
          {status && (
            <span
              role="status"
              className={
                status.ok ? "text-sm text-success" : "text-sm text-danger"
              }
            >
              {status.msg}
            </span>
          )}
          <button
            type="submit"
            disabled={pending}
            className="inline-flex h-11 items-center gap-2 rounded-pill bg-ink px-5 text-sm font-medium text-white transition-colors hover:bg-ink-soft disabled:opacity-60"
          >
            {pending ? (
              <Loader2 className="size-4 animate-spin" aria-hidden />
            ) : (
              <Check className="size-4" aria-hidden />
            )}
            Save profile
          </button>
        </div>
      </div>
    </form>
  );
}

function Section({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <section className="grid gap-5 border-b border-line pb-8 sm:grid-cols-[180px_1fr] sm:gap-8">
      <div>
        <h2 className="font-display text-lg font-semibold tracking-tight">
          {title}
        </h2>
        <p className="mt-1 text-xs text-muted">{description}</p>
      </div>
      <div className="flex flex-col gap-5">{children}</div>
    </section>
  );
}
