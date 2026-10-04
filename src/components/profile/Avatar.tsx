import { cn } from "@/lib/utils";

function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

export function Avatar({
  name,
  src,
  size = 40,
  className,
}: {
  name: string;
  src?: string;
  size?: number;
  className?: string;
}) {
  const style = { width: size, height: size };

  if (src) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt=""
        width={size}
        height={size}
        style={style}
        className={cn("shrink-0 rounded-full object-cover", className)}
      />
    );
  }

  return (
    <span
      style={style}
      aria-hidden
      className={cn(
        "grid shrink-0 place-items-center rounded-full bg-accent-soft font-medium text-accent-hover",
        className,
      )}
    >
      <span style={{ fontSize: Math.max(11, size * 0.36) }}>
        {initials(name) || "?"}
      </span>
    </span>
  );
}
