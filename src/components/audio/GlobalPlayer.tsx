"use client";

import Link from "next/link";
import { Pause, Play, SkipBack, SkipForward, X } from "lucide-react";
import { formatDuration } from "@/lib/audio/format";
import { usePlayer } from "./PlayerProvider";
import { Waveform } from "./Waveform";

export function GlobalPlayer() {
  const {
    track,
    playing,
    currentTime,
    duration,
    toggle,
    seek,
    next,
    prev,
    close,
  } = usePlayer();

  if (!track) return null;

  const total = duration || track.durationSec || 0;
  const progress = total > 0 ? currentTime / total : 0;

  return (
    <>
      <div className="h-24" aria-hidden />
      <div
        role="region"
        aria-label="Audio player"
        className="fixed inset-x-0 bottom-0 z-50 border-t border-line bg-surface/95 backdrop-blur"
      >
        <div className="container-page flex items-center gap-3 py-3 sm:gap-4">
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={prev}
              aria-label="Previous clip"
              className="grid size-9 place-items-center rounded-full text-ink-soft transition-colors hover:bg-paper hover:text-ink"
            >
              <SkipBack className="size-4" aria-hidden />
            </button>
            <button
              type="button"
              onClick={toggle}
              aria-label={playing ? "Pause" : "Play"}
              className="grid size-11 place-items-center rounded-full bg-ink text-white transition-colors hover:bg-ink-soft"
            >
              {playing ? (
                <Pause className="size-5" aria-hidden />
              ) : (
                <Play className="size-5 translate-x-px" aria-hidden />
              )}
            </button>
            <button
              type="button"
              onClick={next}
              aria-label="Next clip"
              className="grid size-9 place-items-center rounded-full text-ink-soft transition-colors hover:bg-paper hover:text-ink"
            >
              <SkipForward className="size-4" aria-hidden />
            </button>
          </div>

          <div className="hidden min-w-0 flex-1 items-center gap-4 sm:flex">
            <div className="min-w-0 basis-40">
              <p className="truncate text-sm font-medium text-ink">
                {track.title}
              </p>
              <Link
                href={`/actors/${track.actorHandle}`}
                className="truncate text-xs text-muted hover:text-accent"
              >
                {track.actorName}
              </Link>
            </div>
            <div className="flex-1">
              <Waveform
                peaks={track.peaks}
                progress={progress}
                onSeek={seek}
                height={36}
                ariaLabel={`Seek within ${track.title}`}
              />
            </div>
            <span className="shrink-0 font-mono text-xs tabular-nums text-muted">
              {formatDuration(currentTime)} / {formatDuration(total)}
            </span>
          </div>

          <div className="min-w-0 flex-1 sm:hidden">
            <p className="truncate text-sm font-medium text-ink">
              {track.title}
            </p>
            <Waveform
              peaks={track.peaks}
              progress={progress}
              onSeek={seek}
              height={20}
              ariaLabel={`Seek within ${track.title}`}
            />
          </div>

          <button
            type="button"
            onClick={close}
            aria-label="Close player"
            className="grid size-9 shrink-0 place-items-center rounded-full text-faint transition-colors hover:bg-paper hover:text-ink"
          >
            <X className="size-4" aria-hidden />
          </button>
        </div>
      </div>
    </>
  );
}
