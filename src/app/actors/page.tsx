import type { Metadata } from "next";
import { getDb } from "@/db";
import { listActors } from "@/db/queries";
import { ActorCard } from "@/components/profile/ActorCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { CATEGORIES, LANGUAGES, VOICE_TAGS } from "@/lib/taxonomy";

export const metadata: Metadata = { title: "Actors" };

function one(value: string | string[] | undefined): string | undefined {
  if (typeof value === "string" && value.trim()) return value.trim();
  return undefined;
}

export default async function ActorsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const filters = {
    search: one(sp.q),
    category: one(sp.category),
    language: one(sp.language),
    tag: one(sp.tag),
  };

  const db = await getDb();
  const actors = await listActors(db, filters);

  return (
    <div className="container-page py-12">
      <header className="mb-8 flex flex-col gap-2">
        <h1 className="font-display text-4xl font-semibold tracking-tight">
          Actors
        </h1>
        <p className="max-w-xl text-muted">
          Browse voice talent by category, language, and voice character.
        </p>
      </header>

      <form
        method="get"
        className="mb-8 flex flex-wrap items-end gap-3 rounded-card border border-line bg-surface p-4"
      >
        <label className="flex min-w-[180px] flex-1 flex-col gap-1.5 text-sm">
          <span className="font-medium text-ink-soft">Search</span>
          <input
            name="q"
            defaultValue={filters.search}
            placeholder="Name, location, or handle"
            className="h-10 rounded-lg border border-line-strong bg-surface px-3 text-ink outline-none focus:border-accent"
          />
        </label>
        <Select name="category" label="Category" options={CATEGORIES} value={filters.category} />
        <Select name="language" label="Language" options={LANGUAGES} value={filters.language} />
        <Select name="tag" label="Voice" options={VOICE_TAGS} value={filters.tag} />
        <button
          type="submit"
          className="h-10 rounded-pill bg-ink px-5 text-sm font-medium text-white transition-colors hover:bg-ink-soft"
        >
          Filter
        </button>
      </form>

      {actors.length === 0 ? (
        <EmptyState
          title="No actors match those filters"
          description="Try widening your search, or clear the filters to see everyone."
        />
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {actors.map((actor) => (
            <ActorCard key={actor.id} actor={actor} />
          ))}
        </div>
      )}
    </div>
  );
}

function Select({
  name,
  label,
  options,
  value,
}: {
  name: string;
  label: string;
  options: readonly string[];
  value?: string;
}) {
  return (
    <label className="flex flex-col gap-1.5 text-sm">
      <span className="font-medium text-ink-soft">{label}</span>
      <select
        name={name}
        defaultValue={value ?? ""}
        className="h-10 rounded-lg border border-line-strong bg-surface px-3 text-ink outline-none focus:border-accent"
      >
        <option value="">Any</option>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}
