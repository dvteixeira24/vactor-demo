import type { Metadata } from "next";
import Link from "next/link";
import { getDb } from "@/db";
import { listJobs, listLatestClips } from "@/db/queries";
import { Hero } from "@/components/home/Hero";
import { CategoryChips } from "@/components/layout/CategoryChips";
import { ClipFeed } from "@/components/clips/ClipFeed";
import { JobCard } from "@/components/jobs/JobCard";
import { EmptyState } from "@/components/ui/EmptyState";

export const metadata: Metadata = {
  title: "Vactor — voice talent, on display",
};

function one(value: string | string[] | undefined): string | undefined {
  if (typeof value === "string" && value.trim()) return value.trim();
  return undefined;
}

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const category = one(sp.category);
  const query = one(sp.q);

  const db = await getDb();
  const [clips, jobs] = await Promise.all([
    listLatestClips(db, { category, search: query, limit: 24 }),
    listJobs(db, { limit: 3 }),
  ]);

  const items = clips.map(({ clip, actor }) => ({ clip, actor }));

  return (
    <div>
      <Hero query={query} />

      <div className="container-page py-10">
        <div className="mb-6">
          <CategoryChips active={category} />
        </div>

        <div className="grid gap-10 lg:grid-cols-[1fr_320px]">
          <section className="min-w-0">
            <div className="mb-4 flex items-baseline justify-between gap-4">
              <h2 className="font-display text-2xl font-semibold tracking-tight">
                {query
                  ? `Results for “${query}”`
                  : category
                    ? `${category} demos`
                    : "Latest demos"}
              </h2>
              <Link
                href="/actors"
                className="whitespace-nowrap text-sm font-medium text-accent hover:text-accent-hover"
              >
                Browse actors →
              </Link>
            </div>

            {items.length === 0 ? (
              <EmptyState
                title="No clips to show yet"
                description={
                  query
                    ? "Nothing matched that search. Try another term."
                    : "Once actors upload demo clips, they'll appear here."
                }
                action={
                  <Link
                    href="/signup"
                    className="rounded-pill bg-ink px-4 py-2 text-sm font-medium text-white hover:bg-ink-soft"
                  >
                    Add your voice
                  </Link>
                }
              />
            ) : (
              <ClipFeed items={items} />
            )}
          </section>

          <aside className="min-w-0">
            <div className="mb-4 flex items-baseline justify-between gap-4">
              <h2 className="font-display text-2xl font-semibold tracking-tight">
                Hiring now
              </h2>
              <Link
                href="/jobs"
                className="whitespace-nowrap text-sm font-medium text-accent hover:text-accent-hover"
              >
                All jobs →
              </Link>
            </div>
            <div className="flex flex-col gap-3">
              {jobs.length === 0 ? (
                <p className="rounded-card border border-dashed border-line-strong p-6 text-center text-sm text-muted">
                  No open roles right now.
                </p>
              ) : (
                jobs.map((job) => <JobCard key={job.id} job={job} />)
              )}
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
