import Link from "next/link";
import { getDb } from "@/db";
import { getDashboardStats, getProfileByUserId } from "@/db/queries";
import { requireUser } from "@/lib/session";

export const metadata = { title: "Dashboard" };

export default async function DashboardPage() {
  const user = await requireUser("/dashboard");
  const db = await getDb();
  const profile = await getProfileByUserId(db, user.id);
  const stats = await getDashboardStats(db, user.id, profile?.id ?? null);

  const cards = [
    { label: "Demo clips", value: String(stats.clipCount), href: "/dashboard/clips", numeric: true },
    { label: "Total plays", value: String(stats.totalPlays), href: "/dashboard/clips", numeric: true },
    { label: "Offers sent", value: String(stats.offerCount), href: "/dashboard/offers", numeric: true },
    {
      label: "Profile",
      value: profile?.isPublished ? "Published" : "Draft",
      href: "/dashboard/profile",
      numeric: false,
    },
  ];

  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-col gap-1">
        <h1 className="font-display text-3xl font-semibold tracking-tight">
          Welcome, {user.name.split(" ")[0]}
        </h1>
        <p className="text-muted">
          Your profile, portfolio, and activity at a glance.
        </p>
      </header>

      {!profile?.isPublished && (
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-card border border-line bg-accent-soft/60 p-5">
          <div>
            <p className="font-medium text-ink">
              {profile ? "Your profile is still a draft" : "Create your profile"}
            </p>
            <p className="text-sm text-ink-soft">
              Publish it to appear in the actor directory and clips feed.
            </p>
          </div>
          <Link
            href="/dashboard/profile"
            className="rounded-pill bg-ink px-4 py-2 text-sm font-medium text-white hover:bg-ink-soft"
          >
            {profile ? "Finish profile" : "Get started"}
          </Link>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => (
          <Link
            key={card.label}
            href={card.href}
            className="rounded-card border border-line bg-surface p-5 transition-shadow hover:shadow-card"
          >
            <p className="text-sm text-muted">{card.label}</p>
            <p
              className={
                card.numeric
                  ? "mt-1 font-display text-3xl font-semibold tabular-nums"
                  : "mt-1 font-display text-xl font-semibold tracking-tight"
              }
            >
              {card.value}
            </p>
          </Link>
        ))}
      </div>

      <div className="flex flex-wrap gap-3">
        <Link
          href="/dashboard/clips/new"
          className="rounded-pill bg-ink px-4 py-2 text-sm font-medium text-white hover:bg-ink-soft"
        >
          Upload a clip
        </Link>
        <Link
          href="/jobs"
          className="rounded-pill border border-line-strong bg-surface px-4 py-2 text-sm font-medium text-ink hover:border-accent-ring"
        >
          Browse jobs
        </Link>
      </div>
    </div>
  );
}
