"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ImagePlus, Loader2 } from "lucide-react";
import { Avatar } from "@/components/profile/Avatar";
import { cn } from "@/lib/utils";

export function ImageUpload({
  kind,
  name,
  currentUrl,
}: {
  kind: "avatar" | "cover";
  name: string;
  currentUrl?: string;
}) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [url, setUrl] = useState(currentUrl);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onFile(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    setBusy(true);
    setError(null);

    const body = new FormData();
    body.set("kind", kind);
    body.set("file", file);

    const response = await fetch("/api/images", { method: "POST", body });
    const data = (await response.json()) as { key?: string; error?: string };
    setBusy(false);
    event.target.value = "";

    if (!response.ok || !data.key) {
      setError(data.error ?? "Upload failed. Try again.");
      return;
    }
    setUrl(`/api/media/${data.key}`);
    router.refresh();
  }

  return (
    <div className="flex items-center gap-4">
      {kind === "avatar" ? (
        <Avatar name={name} src={url} size={72} />
      ) : (
        <div
          className={cn(
            "h-20 flex-1 rounded-card border border-line bg-accent-soft bg-cover bg-center",
          )}
          style={url ? { backgroundImage: `url(${url})` } : undefined}
        />
      )}

      <div className="flex flex-col gap-1">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={busy}
          className="inline-flex items-center gap-2 rounded-pill border border-line-strong bg-surface px-3 py-2 text-sm font-medium text-ink transition-colors hover:border-accent-ring disabled:opacity-60"
        >
          {busy ? (
            <Loader2 className="size-4 animate-spin" aria-hidden />
          ) : (
            <ImagePlus className="size-4" aria-hidden />
          )}
          {kind === "avatar" ? "Change photo" : "Change cover"}
        </button>
        {error && <span className="text-xs text-danger">{error}</span>}
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          onChange={onFile}
          className="hidden"
        />
      </div>
    </div>
  );
}
