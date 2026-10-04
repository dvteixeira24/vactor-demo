"use client";

export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="container-page flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center">
      <p className="rounded-pill border border-line px-3 py-1 text-xs font-medium uppercase tracking-wider text-muted">
        Error
      </p>
      <h1 className="font-display text-3xl font-semibold tracking-tight">
        Something went wrong
      </h1>
      <p className="max-w-md text-muted">
        An unexpected error occurred while rendering this page. You can try
        again.
      </p>
      <button
        type="button"
        onClick={reset}
        className="rounded-pill bg-ink px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-ink-soft"
      >
        Try again
      </button>
    </div>
  );
}
