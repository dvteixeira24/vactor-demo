import { Search } from "lucide-react";

export function Hero({ query }: { query?: string }) {
  return (
    <section className="border-b border-line bg-surface">
      <div className="container-page flex flex-col items-center gap-6 py-16 text-center sm:py-20">
        <p className="rounded-pill border border-line px-3 py-1 text-xs font-medium uppercase tracking-wider text-muted">
          Voice talent, on display
        </p>
        <h1 className="max-w-3xl font-display text-4xl font-semibold leading-[1.05] tracking-tight sm:text-6xl">
          Find the voice that fits your story.
        </h1>
        <p className="max-w-xl text-lg text-ink-soft">
          Listen to demo clips from voice actors, build your own portfolio, and
          pitch for roles — all in one place.
        </p>

        <form
          method="get"
          action="/"
          className="flex w-full max-w-xl items-center gap-2 rounded-pill border border-line-strong bg-surface p-1.5 shadow-card"
        >
          <Search className="ml-3 size-5 shrink-0 text-faint" aria-hidden />
          <input
            name="q"
            defaultValue={query}
            placeholder="Search clips, actors, or styles"
            aria-label="Search clips and actors"
            className="h-10 flex-1 bg-transparent text-ink outline-none placeholder:text-faint"
          />
          <button
            type="submit"
            className="h-10 shrink-0 rounded-pill bg-ink px-5 text-sm font-medium text-white transition-colors hover:bg-ink-soft"
          >
            Search
          </button>
        </form>
      </div>
    </section>
  );
}
