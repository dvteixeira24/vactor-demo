import type { Track } from "@/components/audio/PlayerProvider";
import { ClipCard, type ClipCardActor } from "@/components/clips/ClipCard";
import { clipAudioUrl } from "@/lib/media";
import type { DemoClip } from "@/db/schema";

export function ClipList({
  clips,
  actor,
}: {
  clips: DemoClip[];
  actor: ClipCardActor;
}) {
  const queue: Track[] = clips.map((clip) => ({
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
      {clips.map((clip) => (
        <ClipCard key={clip.id} clip={clip} actor={actor} queue={queue} />
      ))}
    </div>
  );
}
