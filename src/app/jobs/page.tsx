import { Suspense } from "react";
import type { Metadata } from "next";
import { getDb } from "@/db";
import { listJobs, type JobFilters } from "@/db/queries";
import { JobCard } from "@/components/jobs/JobCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { SkeletonGrid } from "@/components/ui/Skeleton";
import { CATEGORIES } from "@/lib/taxonomy";

export const metadata: Metadata = { title: "Jobs" };

function one(value: string | string[] | undefined): string | undefined {
  if (typeof value === "string" && value.trim()) return value.trim();
  return undefined;
}

export default async function JobsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const filters: JobFilters = {
    search: one(sp.q),
    category: one(sp.category),
    locationType: one(sp.location),
  };

  return (
    <div className="container-page py-12">
      <header className="mb-8 flex flex-col gap-2">
        <h1 className="font-display text-4xl font-semibold tracking-tight">
          Jobs
        </h1>
        <p className="max-w-xl text-muted">
          Open voice-acting roles. Submit an offer with your rate and a short
          pitch.
        </p>
      </header>

      <form
        method="get"
        className="mb-8 flex flex-wrap items-end gap-3 rounded-card border border-line bg-surface p-4"
      >
        <label className="flex min-w-[200px] flex-1 flex-col gap-1.5 text-sm">
          <span className="font-medium text-ink-soft">Search</span>
          <input
            name="q"
            defaultValue={filters.search}
            placeholder="Role, client, or keyword"
            className="h-10 rounded-lg border border-line-strong bg-surface px-3 text-ink outline-none focus:border-accent"
          />
        </label>
        <label className="flex flex-col gap-1.5 text-sm">
          <span className="font-medium text-ink-soft">Category</span>
          <select
            name="category"
            defaultValue={filters.category ?? ""}
            className="h-10 rounded-lg border border-line-strong bg-surface px-3 text-ink outline-none focus:border-accent"
          >
            <option value="">Any</option>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1.5 text-sm">
          <span className="font-medium text-ink-soft">Location</span>
          <select
            name="location"
            defaultValue={filters.locationType ?? ""}
            className="h-10 rounded-lg border border-line-strong bg-surface px-3 text-ink outline-none focus:border-accent"
          >
            <option value="">Any</option>
            <option value="remote">Remote</option>
            <option value="onsite">On-site</option>
          </select>
        </label>
        <button
          type="submit"
          className="h-10 rounded-pill bg-ink px-5 text-sm font-medium text-white transition-colors hover:bg-ink-soft"
        >
          Filter
        </button>
      </form>

      <Suspense fallback={<SkeletonGrid itemClassName="h-44" />}>
        <JobsResults filters={filters} />
      </Suspense>
    </div>
  );
}

async function JobsResults({ filters }: { filters: JobFilters }) {
  const db = await getDb();
  const jobs = await listJobs(db, filters);

  if (jobs.length === 0) {
    return (
      <EmptyState
        title="No jobs match those filters"
        description="Try clearing the filters to see everything that's open."
      />
    );
  }

  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {jobs.map((job) => (
        <JobCard key={job.id} job={job} />
      ))}
    </div>
  );
}
