"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Trash2 } from "lucide-react";
import { deleteClip } from "@/app/actions/clips";
import { Badge } from "@/components/ui/Badge";
import { formatDuration } from "@/lib/audio/format";
import type { DemoClip } from "@/db/schema";

export function ManageClipRow({ clip }: { clip: DemoClip }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function onDelete() {
    if (!window.confirm(`Delete “${clip.title}”? This can't be undone.`)) return;
    startTransition(async () => {
      const result = await deleteClip(clip.id);
      if (result.ok) {
        router.refresh();
      } else {
        setError(result.error);
      }
    });
  }

  return (
    <li className="flex items-center justify-between gap-4 rounded-card border border-line bg-surface p-4">
      <div className="min-w-0">
        <p className="truncate font-medium text-ink">{clip.title}</p>
        <div className="mt-1 flex items-center gap-3 text-xs text-muted">
          <Badge tone="accent">{clip.category}</Badge>
          <span className="font-mono tabular-nums">
            {formatDuration(clip.durationSec)}
          </span>
          <span>{clip.playCount} plays</span>
        </div>
        {error && <p className="mt-1 text-xs text-danger">{error}</p>}
      </div>
      <button
        type="button"
        onClick={onDelete}
        disabled={pending}
        aria-label={`Delete ${clip.title}`}
        className="inline-flex items-center gap-1.5 rounded-pill border border-line-strong px-3 py-2 text-sm text-ink-soft transition-colors hover:border-danger hover:text-danger disabled:opacity-60"
      >
        {pending ? (
          <Loader2 className="size-4 animate-spin" aria-hidden />
        ) : (
          <Trash2 className="size-4" aria-hidden />
        )}
        Delete
      </button>
    </li>
  );
}
