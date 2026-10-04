"use client";

import type { Track } from "@/components/audio/PlayerProvider";
import { ClipCard, type ClipCardActor } from "@/components/clips/ClipCard";
import { clipAudioUrl } from "@/lib/media";
import type { DemoClip } from "@/db/schema";

export type FeedItem = { clip: DemoClip; actor: ClipCardActor };

export function ClipFeed({ items }: { items: FeedItem[] }) {
  const queue: Track[] = items.map(({ clip, actor }) => ({
    id: clip.id,
    title: clip.title,
    audioUrl: clipAudioUrl(clip.id),
    peaks: clip.peaks,
    durationSec: clip.durationSec,
    category: clip.category,
    actorName: actor.displayName,
    actorHandle: actor.handle,
  }));

  return (
    <div className="flex flex-col gap-3">
      {items.map(({ clip, actor }) => (
        <ClipCard key={clip.id} clip={clip} actor={actor} queue={queue} />
      ))}
    </div>
  );
}
