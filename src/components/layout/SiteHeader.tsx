import Link from "next/link";
import { AudioLines } from "lucide-react";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-paper/85 backdrop-blur">
      <div className="container-page flex h-16 items-center justify-between gap-6">
        <Link
          href="/"
          className="flex items-center gap-2 font-display text-xl font-semibold tracking-tight text-ink"
        >
          <AudioLines className="size-5 text-accent" aria-hidden />
          Vactor
        </Link>

        <nav className="hidden items-center gap-1 text-sm sm:flex" aria-label="Primary">
          <Link
            href="/actors"
            className="rounded-full px-3 py-2 text-ink-soft transition-colors hover:bg-surface hover:text-ink"
          >
            Actors
          </Link>
          <Link
            href="/jobs"
            className="rounded-full px-3 py-2 text-ink-soft transition-colors hover:bg-surface hover:text-ink"
          >
            Jobs
          </Link>
        </nav>

        <div className="flex items-center gap-2">
          <Link
            href="/login"
            className="rounded-full px-3 py-2 text-sm font-medium text-ink-soft transition-colors hover:text-ink"
          >
            Sign in
          </Link>
          <Link
            href="/signup"
            className="rounded-pill bg-ink px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-ink-soft"
          >
            Get started
          </Link>
        </div>
      </div>
    </header>
  );
}
