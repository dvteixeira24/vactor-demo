import Link from "next/link";
import { MapPin, Mic2 } from "lucide-react";
import { Avatar } from "@/components/profile/Avatar";
import { Badge } from "@/components/ui/Badge";
import { mediaUrl } from "@/lib/media";
import type { ActorListItem } from "@/db/queries";

export function ActorCard({ actor }: { actor: ActorListItem }) {
  return (
    <Link
      href={`/actors/${actor.handle}`}
      className="group flex flex-col gap-4 rounded-card border border-line bg-surface p-5 transition-shadow hover:shadow-card"
    >
      <div className="flex items-center gap-3">
        <Avatar
          name={actor.displayName}
          src={mediaUrl(actor.avatarKey)}
          size={48}
        />
        <div className="min-w-0">
          <p className="truncate font-medium text-ink group-hover:text-accent-hover">
            {actor.displayName}
          </p>
          <p className="truncate text-xs text-muted">@{actor.handle}</p>
        </div>
      </div>

      {actor.tagline && (
        <p className="line-clamp-2 text-sm text-ink-soft">{actor.tagline}</p>
      )}

      {actor.voiceTags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {actor.voiceTags.slice(0, 3).map((tag) => (
            <Badge key={tag}>{tag}</Badge>
          ))}
        </div>
      )}

      <div className="mt-auto flex items-center justify-between gap-3 border-t border-line pt-3 text-xs text-faint">
        <span className="inline-flex items-center gap-1">
          <Mic2 className="size-3.5" aria-hidden />
          {actor.clipCount} {actor.clipCount === 1 ? "clip" : "clips"}
        </span>
        {actor.location && (
          <span className="inline-flex items-center gap-1 truncate">
            <MapPin className="size-3.5" aria-hidden />
            {actor.location}
          </span>
        )}
      </div>
    </Link>
  );
}
