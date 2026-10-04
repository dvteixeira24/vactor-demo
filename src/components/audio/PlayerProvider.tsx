"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

export type Track = {
  id: string;
  title: string;
  audioUrl: string;
  peaks: number[];
  durationSec: number;
  category: string;
  actorName: string;
  actorHandle: string;
};

type PlayerContextValue = {
  track: Track | null;
  queue: Track[];
  playing: boolean;
  currentTime: number;
  duration: number;
  currentId: string | null;
  play: (track: Track, queue?: Track[]) => void;
  toggle: () => void;
  seek: (ratio: number) => void;
  next: () => void;
  prev: () => void;
  close: () => void;
  isCurrent: (id: string) => boolean;
};

const PlayerContext = createContext<PlayerContextValue | null>(null);

export function usePlayer(): PlayerContextValue {
  const value = useContext(PlayerContext);
  if (!value) {
    throw new Error("usePlayer must be used within a PlayerProvider");
  }
  return value;
}

export function PlayerProvider({ children }: { children: React.ReactNode }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [track, setTrack] = useState<Track | null>(null);
  const [queue, setQueue] = useState<Track[]>([]);
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const queueRef = useRef<Track[]>([]);
  const indexRef = useRef(0);
  useEffect(() => {
    queueRef.current = queue;
  }, [queue]);
  useEffect(() => {
    indexRef.current = index;
  }, [index]);

  const startTrack = useCallback((next: Track, position: number) => {
    const audio = audioRef.current;
    if (!audio) return;
    setIndex(position);
    indexRef.current = position;
    setTrack(next);
    setCurrentTime(0);
    setDuration(next.durationSec || 0);
    audio.src = next.audioUrl;
    audio.currentTime = 0;
    audio
      .play()
      .then(() => setPlaying(true))
      .catch(() => setPlaying(false));
    void fetch(`/api/clips/${next.id}/play`, { method: "POST" }).catch(
      () => undefined,
    );
  }, []);

  const go = useCallback(
    (position: number) => {
      const list = queueRef.current;
      if (position < 0 || position >= list.length) return;
      startTrack(list[position], position);
    },
    [startTrack],
  );

  useEffect(() => {
    const audio = new Audio();
    audio.preload = "metadata";
    audioRef.current = audio;

    const onTime = () => setCurrentTime(audio.currentTime);
    const onLoaded = () => {
      if (Number.isFinite(audio.duration)) setDuration(audio.duration);
    };
    const onPlay = () => setPlaying(true);
    const onPause = () => setPlaying(false);
    const onEnded = () => {
      const nextPosition = indexRef.current + 1;
      if (nextPosition < queueRef.current.length) {
        go(nextPosition);
      } else {
        setPlaying(false);
      }
    };

    audio.addEventListener("timeupdate", onTime);
    audio.addEventListener("loadedmetadata", onLoaded);
    audio.addEventListener("play", onPlay);
    audio.addEventListener("pause", onPause);
    audio.addEventListener("ended", onEnded);

    return () => {
      audio.pause();
      audio.removeEventListener("timeupdate", onTime);
      audio.removeEventListener("loadedmetadata", onLoaded);
      audio.removeEventListener("play", onPlay);
      audio.removeEventListener("pause", onPause);
      audio.removeEventListener("ended", onEnded);
    };
  }, [go]);

  const play = useCallback(
    (next: Track, list?: Track[]) => {
      const nextQueue = list && list.length > 0 ? list : [next];
      setQueue(nextQueue);
      queueRef.current = nextQueue;
      const position = Math.max(
        0,
        nextQueue.findIndex((t) => t.id === next.id),
      );
      startTrack(next, position);
    },
    [startTrack],
  );

  const toggle = useCallback(() => {
    const audio = audioRef.current;
    if (!audio || !track) return;
    if (audio.paused) {
      void audio.play().catch(() => setPlaying(false));
    } else {
      audio.pause();
    }
  }, [track]);

  const seek = useCallback(
    (ratio: number) => {
      const audio = audioRef.current;
      if (!audio) return;
      const total = audio.duration || duration || track?.durationSec || 0;
      audio.currentTime = Math.min(1, Math.max(0, ratio)) * total;
      setCurrentTime(audio.currentTime);
    },
    [duration, track],
  );

  const next = useCallback(() => go(indexRef.current + 1), [go]);
  const prev = useCallback(() => {
    const audio = audioRef.current;
    if (audio && audio.currentTime > 3) {
      audio.currentTime = 0;
      return;
    }
    go(indexRef.current - 1);
  }, [go]);

  const close = useCallback(() => {
    const audio = audioRef.current;
    if (audio) {
      audio.pause();
      audio.removeAttribute("src");
    }
    setTrack(null);
    setPlaying(false);
    setCurrentTime(0);
  }, []);

  const value = useMemo<PlayerContextValue>(
    () => ({
      track,
      queue,
      playing,
      currentTime,
      duration,
      currentId: track?.id ?? null,
      play,
      toggle,
      seek,
      next,
      prev,
      close,
      isCurrent: (id: string) => track?.id === id,
    }),
    [track, queue, playing, currentTime, duration, play, toggle, seek, next, prev, close],
  );

  return (
    <PlayerContext.Provider value={value}>{children}</PlayerContext.Provider>
  );
}
