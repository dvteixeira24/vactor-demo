import Link from "next/link";
import { AudioLines } from "lucide-react";

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-line bg-surface">
      <div className="container-page flex flex-col gap-6 py-10 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2 font-display text-lg font-semibold tracking-tight">
          <AudioLines className="size-5 text-accent" aria-hidden />
          Vactor
        </div>
        <nav className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted" aria-label="Footer">
          <Link href="/actors" className="hover:text-ink">
            Actors
          </Link>
          <Link href="/jobs" className="hover:text-ink">
            Jobs
          </Link>
          <Link href="/signup" className="hover:text-ink">
            Join
          </Link>
        </nav>
        <p className="text-xs text-faint">
          A voice-acting portfolio demo. Not a real marketplace.
        </p>
      </div>
    </footer>
  );
}
