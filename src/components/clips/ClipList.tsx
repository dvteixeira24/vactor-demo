import { Badge } from "@/components/ui/Badge";
import type { DemoClip } from "@/db/schema";

/**
 * Placeholder list used on the public profile until the waveform player
 * lands (Task 5/6 swaps this for the interactive ClipCard).
 */
export function ClipList({ clips }: { clips: DemoClip[] }) {
  return (
    <ul className="flex flex-col gap-3">
      {clips.map((clip) => (
        <li
          key={clip.id}
          className="flex items-center justify-between gap-4 rounded-card border border-line bg-surface p-4"
        >
          <div className="min-w-0">
            <p className="truncate font-medium text-ink">{clip.title}</p>
            {clip.description && (
              <p className="truncate text-sm text-muted">{clip.description}</p>
            )}
          </div>
          <Badge tone="accent">{clip.category}</Badge>
        </li>
      ))}
    </ul>
  );
}
