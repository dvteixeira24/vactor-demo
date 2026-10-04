"use client";

import Link from "next/link";
import { Pause, Play } from "lucide-react";
import { usePlayer, type Track } from "@/components/audio/PlayerProvider";
import { Waveform } from "@/components/audio/Waveform";
import { Badge } from "@/components/ui/Badge";
import { formatDuration } from "@/lib/audio/format";
import { clipAudioUrl } from "@/lib/media";
import type { DemoClip } from "@/db/schema";

export type ClipCardActor = { displayName: string; handle: string };

export function ClipCard({
  clip,
  actor,
  queue,
}: {
  clip: DemoClip;
  actor: ClipCardActor;
  queue?: Track[];
}) {
  const { play, toggle, isCurrent, playing, currentTime, duration, seek } =
    usePlayer();

  const track: Track = {
    id: clip.id,
    title: clip.title,
    audioUrl: clipAudioUrl(clip.id),
    peaks: clip.peaks,
    durationSec: clip.durationSec,
    category: clip.category,
    actorName: actor.displayName,
    actorHandle: actor.handle,
  };

  const current = isCurrent(clip.id);
  const total = current ? duration || clip.durationSec : clip.durationSec;
  const progress = current && total > 0 ? currentTime / total : 0;
  const isPlaying = current && playing;

  return (
    <article className="flex items-center gap-4 rounded-card border border-line bg-surface p-4 transition-shadow hover:shadow-card">
      <button
        type="button"
        onClick={() => (current ? toggle() : play(track, queue))}
        aria-label={isPlaying ? `Pause ${clip.title}` : `Play ${clip.title}`}
        className="grid size-11 shrink-0 place-items-center rounded-full bg-ink text-white transition-colors hover:bg-accent"
      >
        {isPlaying ? (
          <Pause className="size-5" aria-hidden />
        ) : (
          <Play className="size-5 translate-x-px" aria-hidden />
        )}
      </button>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <h3 className="truncate font-medium text-ink">{clip.title}</h3>
          <Badge tone="accent" className="hidden sm:inline-flex">
            {clip.category}
          </Badge>
        </div>
        <Link
          href={`/actors/${actor.handle}`}
          className="text-xs text-muted hover:text-accent"
        >
          {actor.displayName}
        </Link>
        <div className="mt-1.5">
          <Waveform
            peaks={clip.peaks}
            progress={progress}
            onSeek={current ? seek : undefined}
            height={28}
            ariaLabel={`Seek within ${clip.title}`}
          />
        </div>
      </div>

      <div className="hidden shrink-0 flex-col items-end gap-1 sm:flex">
        <span className="font-mono text-xs tabular-nums text-muted">
          {formatDuration(total)}
        </span>
        <span className="text-xs text-faint">{clip.playCount} plays</span>
      </div>
    </article>
  );
}
