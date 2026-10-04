import Link from "next/link";
import { getDb } from "@/db";
import { listOffersByUser } from "@/db/queries";
import { requireUser } from "@/lib/session";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { formatRateType, type OfferStatus } from "@/lib/taxonomy";

export const metadata = { title: "Offers" };

const tone: Record<OfferStatus, "neutral" | "accent" | "success" | "danger"> = {
  submitted: "neutral",
  shortlisted: "accent",
  accepted: "success",
  declined: "danger",
};

export default async function OffersPage() {
  const user = await requireUser("/dashboard/offers");
  const db = await getDb();
  const offers = await listOffersByUser(db, user.id);

  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-col gap-1">
        <h1 className="font-display text-3xl font-semibold tracking-tight">
          Offers
        </h1>
        <p className="text-muted">Offers you've sent and where they stand.</p>
      </header>

      {offers.length === 0 ? (
        <EmptyState
          title="No offers yet"
          description="Browse the job board and pitch for a role to see it here."
          action={
            <Link
              href="/jobs"
              className="rounded-pill bg-ink px-4 py-2 text-sm font-medium text-white hover:bg-ink-soft"
            >
              Browse jobs
            </Link>
          }
        />
      ) : (
        <ul className="flex flex-col gap-3">
          {offers.map(({ offer, job }) => (
            <li
              key={offer.id}
              className="flex flex-wrap items-center justify-between gap-4 rounded-card border border-line bg-surface p-4"
            >
              <div className="min-w-0">
                {job ? (
                  <Link
                    href={`/jobs/${job.id}`}
                    className="font-medium text-ink hover:text-accent-hover"
                  >
                    {job.title}
                  </Link>
                ) : (
                  <span className="font-medium text-ink">Job removed</span>
                )}
                <p className="mt-1 text-sm text-muted">
                  {offer.currency} {offer.rateAmount}{" "}
                  {formatRateType(offer.rateType)}
                  {job ? ` · ${job.clientName}` : ""}
                </p>
              </div>
              <Badge tone={tone[offer.status]}>{offer.status}</Badge>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
