import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Building2, CalendarClock, MapPin } from "lucide-react";
import { getDb } from "@/db";
import { getJobById, getOffer } from "@/db/queries";
import { getSession } from "@/lib/session";
import { OfferForm } from "@/components/jobs/OfferForm";
import { Badge } from "@/components/ui/Badge";
import { formatBudget } from "@/lib/jobs";
import { formatRateType } from "@/lib/taxonomy";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const db = await getDb();
  const job = await getJobById(db, id);
  return { title: job ? job.title : "Job" };
}

function formatDeadline(value: string | null): string | null {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default async function JobDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const db = await getDb();
  const job = await getJobById(db, id);
  if (!job || !job.isActive) notFound();

  const session = await getSession();
  const existingOffer = session
    ? await getOffer(db, job.id, session.user.id)
    : null;

  const deadline = formatDeadline(job.deadline);

  return (
    <div className="container-page py-12">
      <Link href="/jobs" className="text-sm text-muted hover:text-ink">
        ← All jobs
      </Link>

      <div className="mt-6 grid gap-10 lg:grid-cols-[1fr_360px]">
        <article className="min-w-0">
          <div className="flex flex-wrap items-center gap-3">
            <Badge tone="accent">{job.category}</Badge>
            <span className="inline-flex items-center gap-1 text-xs text-muted">
              <MapPin className="size-3.5" aria-hidden />
              {job.locationType === "remote" ? "Remote" : "On-site"}
            </span>
          </div>

          <h1 className="mt-4 font-display text-4xl font-semibold tracking-tight">
            {job.title}
          </h1>

          <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-muted">
            <span className="inline-flex items-center gap-1.5">
              <Building2 className="size-4" aria-hidden />
              {job.clientName}
            </span>
            {deadline && (
              <span className="inline-flex items-center gap-1.5">
                <CalendarClock className="size-4" aria-hidden />
                Apply by {deadline}
              </span>
            )}
          </div>

          <div className="mt-6 rounded-card border border-line bg-surface p-5">
            <p className="text-sm text-muted">Budget</p>
            <p className="mt-1 text-xl font-medium text-ink">
              {formatBudget(job)}
              <span className="ml-1.5 text-sm font-normal text-muted">
                {formatRateType(job.rateType)}
              </span>
            </p>
          </div>

          <div className="prose prose-neutral mt-8 max-w-none">
            <p className="whitespace-pre-line text-ink-soft">
              {job.description}
            </p>
          </div>

          {job.tags.length > 0 && (
            <div className="mt-8 flex flex-wrap gap-2">
              {job.tags.map((tag) => (
                <Badge key={tag}>{tag}</Badge>
              ))}
            </div>
          )}
        </article>

        <aside className="min-w-0">
          <div className="sticky top-24 rounded-card border border-line bg-surface p-5">
            {!session ? (
              <div className="flex flex-col gap-3 text-center">
                <p className="font-medium text-ink">
                  Sign in to submit an offer
                </p>
                <p className="text-sm text-muted">
                  Create a profile and pitch your rate for this role.
                </p>
                <Link
                  href={`/login?callbackUrl=${encodeURIComponent(`/jobs/${job.id}`)}`}
                  className="rounded-pill bg-ink px-4 py-2 text-sm font-medium text-white hover:bg-ink-soft"
                >
                  Sign in
                </Link>
              </div>
            ) : (
              <>
                <h2 className="mb-4 font-display text-lg font-semibold tracking-tight">
                  {existingOffer ? "Your offer" : "Make an offer"}
                </h2>
                {existingOffer && (
                  <p className="mb-4 text-sm text-muted">
                    You submitted this offer — update it any time.
                  </p>
                )}
                <OfferForm jobId={job.id} initial={existingOffer} />
              </>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
