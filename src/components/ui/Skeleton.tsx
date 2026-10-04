import { cn } from "@/lib/utils";

export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={cn("animate-pulse rounded-md bg-line", className)}
    />
  );
}

export function SkeletonGrid({
  count = 6,
  itemClassName = "h-52",
}: {
  count?: number;
  itemClassName?: string;
}) {
  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <Skeleton key={i} className={cn("w-full rounded-card", itemClassName)} />
      ))}
    </div>
  );
}

