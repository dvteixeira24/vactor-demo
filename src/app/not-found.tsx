import Link from "next/link";

export default function NotFound() {
  return (
    <div className="container-page flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center">
      <p className="rounded-pill border border-line px-3 py-1 text-xs font-medium uppercase tracking-wider text-muted">
        404
      </p>
      <h1 className="font-display text-4xl font-semibold tracking-tight">
        We couldn't find that
      </h1>
      <p className="max-w-md text-muted">
        The page you're looking for doesn't exist, or the actor or job has been
        removed.
      </p>
      <div className="flex gap-3">
        <Link
          href="/"
          className="rounded-pill bg-ink px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-ink-soft"
        >
          Back home
        </Link>
        <Link
          href="/actors"
          className="rounded-pill border border-line-strong bg-surface px-5 py-2.5 text-sm font-medium text-ink hover:border-accent-ring"
        >
          Browse actors
        </Link>
      </div>
    </div>
  );
}
