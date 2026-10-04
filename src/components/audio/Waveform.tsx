"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

const PLAYED = "#4f46e5";
const UNPLAYED = "#d6d3cc";

export function Waveform({
  peaks,
  progress = 0,
  onSeek,
  height = 48,
  className,
  ariaLabel = "Seek",
}: {
  peaks: number[];
  progress?: number;
  onSeek?: (ratio: number) => void;
  height?: number;
  className?: string;
  ariaLabel?: string;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setWidth(Math.floor(entry.contentRect.width));
      }
    });
    observer.observe(canvas);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || width === 0) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, width, height);

    const bars = peaks.length || 1;
    const barWidth = width / bars;
    const gap = Math.min(1.5, barWidth * 0.35);
    const bar = Math.max(1, barWidth - gap);
    const playedX = progress * width;

    for (let i = 0; i < bars; i += 1) {
      const amp = Math.max(0.05, peaks[i] ?? 0);
      const barHeight = amp * (height - 4);
      const x = i * barWidth + gap / 2;
      const y = (height - barHeight) / 2;
      ctx.fillStyle = x + bar <= playedX ? PLAYED : UNPLAYED;
      ctx.fillRect(x, y, bar, barHeight);
    }
  }, [peaks, progress, height, width]);

  const seekFromClientX = useCallback(
    (clientX: number) => {
      const canvas = canvasRef.current;
      if (!canvas || !onSeek) return;
      const rect = canvas.getBoundingClientRect();
      const ratio = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width));
      onSeek(ratio);
    },
    [onSeek],
  );

  return (
    <canvas
      ref={canvasRef}
      role="slider"
      tabIndex={onSeek ? 0 : -1}
      aria-label={ariaLabel}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(progress * 100)}
      onClick={(e) => seekFromClientX(e.clientX)}
      onKeyDown={(e) => {
        if (!onSeek) return;
        if (e.key === "ArrowRight") onSeek(Math.min(1, progress + 0.05));
        if (e.key === "ArrowLeft") onSeek(Math.max(0, progress - 0.05));
      }}
      style={{ height, width: "100%" }}
      className={cn(onSeek && "cursor-pointer", className)}
    />
  );
}
