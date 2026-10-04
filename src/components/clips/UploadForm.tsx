"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Loader2, UploadCloud } from "lucide-react";
import { TextArea, TextField } from "@/components/ui/Field";
import { Waveform } from "@/components/audio/Waveform";
import { formatDuration } from "@/lib/audio/format";
import { downsamplePeaks } from "@/lib/audio/peaks";
import { CATEGORIES } from "@/lib/taxonomy";
import { PEAK_BUCKETS, validateAudio } from "@/lib/upload-limits";
import { cn } from "@/lib/utils";

type Analysis = { durationSec: number; peaks: number[] };

async function analyze(file: File): Promise<Analysis> {
  const AudioCtx =
    window.AudioContext ||
    (window as unknown as { webkitAudioContext: typeof AudioContext })
      .webkitAudioContext;
  const ctx = new AudioCtx();
  try {
    const buffer = await file.arrayBuffer();
    const audioBuffer = await ctx.decodeAudioData(buffer.slice(0));
    return {
      durationSec: audioBuffer.duration,
      peaks: downsamplePeaks(audioBuffer.getChannelData(0), PEAK_BUCKETS),
    };
  } finally {
    void ctx.close();
  }
}

function upload(
  url: string,
  body: FormData,
  onProgress: (ratio: number) => void,
): Promise<{ ok: boolean; data: { error?: string; id?: string } }> {
  return new Promise((resolve) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", url);
    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) onProgress(event.loaded / event.total);
    };
    xhr.onload = () => {
      let data: { error?: string; id?: string } = {};
      try {
        data = JSON.parse(xhr.responseText);
      } catch {
        /* ignore */
      }
      resolve({ ok: xhr.status >= 200 && xhr.status < 300, data });
    };
    xhr.onerror = () => resolve({ ok: false, data: { error: "Network error" } });
    xhr.send(body);
  });
}

export function UploadForm() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  const [file, setFile] = useState<File | null>(null);
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<string>(CATEGORIES[0]);
  const [description, setDescription] = useState("");
  const [tagText, setTagText] = useState("");
  const [phase, setPhase] = useState<"idle" | "analyzing" | "uploading" | "done">(
    "idle",
  );
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);

  async function onFile(selected: File) {
    const check = validateAudio({ type: selected.type, size: selected.size });
    if (!check.ok) {
      setError(check.error);
      setFile(null);
      setAnalysis(null);
      return;
    }
    setError(null);
    setFile(selected);
    setAnalysis(null);
    setTitle((prev) => prev || selected.name.replace(/\.[^.]+$/, "").slice(0, 100));
    setPhase("analyzing");
    try {
      setAnalysis(await analyze(selected));
    } catch {
      setError(
        "Couldn't read that audio file. Try a different format (MP3 or WAV).",
      );
      setFile(null);
    } finally {
      setPhase("idle");
    }
  }

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!file || !analysis) {
      setError("Choose an audio file first.");
      return;
    }
    setError(null);
    setPhase("uploading");
    setProgress(0);

    const body = new FormData();
    body.set("file", file);
    body.set("title", title);
    body.set("category", category);
    body.set("description", description);
    body.set(
      "tags",
      JSON.stringify(
        tagText
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean),
      ),
    );
    body.set("durationSec", String(analysis.durationSec));
    body.set("peaks", JSON.stringify(analysis.peaks));

    const result = await upload("/api/clips", body, setProgress);
    if (!result.ok) {
      setError(result.data.error ?? "Upload failed. Try again.");
      setPhase("idle");
      return;
    }
    setPhase("done");
    router.push("/dashboard/clips");
    router.refresh();
  }

  const busy = phase === "analyzing" || phase === "uploading";

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-6">
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          const dropped = e.dataTransfer.files?.[0];
          if (dropped) void onFile(dropped);
        }}
        className={cn(
          "flex flex-col items-center gap-3 rounded-card border border-dashed px-6 py-10 text-center transition-colors",
          dragOver ? "border-accent bg-accent-soft/50" : "border-line-strong bg-surface",
        )}
      >
        <UploadCloud className="size-8 text-accent" aria-hidden />
        <div>
          <p className="font-medium text-ink">
            {file ? file.name : "Drop an audio file here"}
          </p>
          <p className="text-sm text-muted">
            MP3, WAV, M4A, OGG or WebM · up to 25 MB
          </p>
        </div>
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="rounded-pill border border-line-strong bg-surface px-4 py-2 text-sm font-medium text-ink hover:border-accent-ring"
        >
          Choose file
        </button>
        <input
          ref={inputRef}
          type="file"
          accept="audio/*"
          className="hidden"
          onChange={(e) => {
            const selected = e.target.files?.[0];
            if (selected) void onFile(selected);
          }}
        />
      </div>

      {phase === "analyzing" && (
        <p className="flex items-center gap-2 text-sm text-muted">
          <Loader2 className="size-4 animate-spin" aria-hidden />
          Reading waveform…
        </p>
      )}

      {analysis && file && (
        <div className="rounded-card border border-line bg-surface p-4">
          <div className="mb-2 flex items-center justify-between text-sm">
            <span className="font-medium text-ink">Preview</span>
            <span className="font-mono text-xs tabular-nums text-muted">
              {formatDuration(analysis.durationSec)}
            </span>
          </div>
          <Waveform peaks={analysis.peaks} height={56} ariaLabel="Waveform preview" />
        </div>
      )}

      <div className="grid gap-5 sm:grid-cols-2">
        <TextField
          label="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Warm commercial read"
          required
          maxLength={100}
        />
        <label className="flex flex-col gap-1.5 text-sm">
          <span className="font-medium text-ink-soft">Category</span>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="h-11 rounded-lg border border-line-strong bg-surface px-3 text-ink outline-none focus:border-accent"
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </label>
      </div>

      <TextArea
        label="Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        rows={3}
        maxLength={1000}
        placeholder="What's the character, tone, or context?"
      />

      <TextField
        label="Tags"
        value={tagText}
        onChange={(e) => setTagText(e.target.value)}
        placeholder="comma, separated, tags"
        hint="Optional — e.g. warm, conversational, youthful"
      />

      {phase === "uploading" && (
        <div>
          <div className="h-2 overflow-hidden rounded-full bg-line">
            <div
              className="h-full bg-accent transition-[width]"
              style={{ width: `${Math.round(progress * 100)}%` }}
            />
          </div>
          <p className="mt-1 text-xs text-muted">
            Uploading… {Math.round(progress * 100)}%
          </p>
        </div>
      )}

      {error && (
        <p role="alert" className="rounded-lg bg-danger-soft px-3 py-2 text-sm text-danger">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={busy || !analysis}
        className="inline-flex h-11 items-center justify-center gap-2 self-start rounded-pill bg-ink px-5 text-sm font-medium text-white transition-colors hover:bg-ink-soft disabled:opacity-60"
      >
        {phase === "uploading" ? (
          <Loader2 className="size-4 animate-spin" aria-hidden />
        ) : (
          <Check className="size-4" aria-hidden />
        )}
        Publish clip
      </button>
    </form>
  );
}
